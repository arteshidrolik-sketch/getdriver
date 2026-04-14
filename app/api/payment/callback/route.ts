import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();

    const merchantOid = body.get('merchant_oid') as string;
    const status = body.get('status') as string;
    const totalAmount = body.get('total_amount') as string;
    const paymentType = body.get('payment_type') as string;
    const paymentAmount = body.get('payment_amount') as string;
    const currency = body.get('currency') as string;
    const hash = body.get('hash') as string;

    console.log('PayTR callback received:', { merchantOid, status, totalAmount, paymentType });

    // Hash doğrulama
    const merchantKey = process.env.PAYTR_MERCHANT_KEY!;
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT!;

    const hashStr = `${merchantOid}${merchantSalt}${status}${totalAmount}`;
    const calculatedHash = crypto
      .createHmac('sha256', merchantKey)
      .update(hashStr)
      .digest('base64');

    if (hash !== calculatedHash) {
      console.error('PayTR callback: Hash mismatch');
      return NextResponse.json({ error: 'Invalid hash' }, { status: 400 });
    }

    // merchant_oid formatı: RIDE_{rideId}_{timestamp}
    // rideId'yi çıkar
    const match = merchantOid.match(/^RIDE_(.+?)_\d+$/);
    if (!match) {
      console.error('PayTR callback: Invalid merchant_oid format:', merchantOid);
      return NextResponse.json({ error: 'Invalid merchant_oid' }, { status: 400 });
    }

    const rideId = match[1];

    if (status === 'success') {
      // Yolculuğu ve ödemeyi güncelle
      const ride = await prisma.ride.findUnique({
        where: { id: rideId },
        include: {
          payment: true,
          driver: true,
        },
      });

      if (!ride) {
        console.error('PayTR callback: Ride not found:', rideId);
        return NextResponse.json({ error: 'Ride not found' }, { status: 404 });
      }

      // Ödemeyi tamamlandı olarak işaretle
      await prisma.payment.update({
        where: { rideId: ride.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
          providerRef: merchantOid,
        },
      });

      // Yolculuğu tamamlandı olarak işaretle
      await prisma.ride.update({
        where: { id: ride.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      // Sürücü istatistiklerini güncelle
      if (ride.driver) {
        await prisma.driver.update({
          where: { id: ride.driver.id },
          data: {
            totalRides: { increment: 1 },
            totalEarnings: { increment: ride.driverAmount },
          },
        });
      }

      console.log('PayTR callback: Payment successful for ride:', rideId);
    } else {
      console.log('PayTR callback: Payment failed for ride:', rideId, 'status:', status);
      
      // Başarısız ödemeyi kaydet
      await prisma.payment.updateMany({
        where: { providerRef: merchantOid },
        data: {
          status: 'FAILED',
        },
      });
    }

    // PayTR'a başarılı yanıt gönder
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('PayTR callback error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
