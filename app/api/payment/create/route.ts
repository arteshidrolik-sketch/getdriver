import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;
  return '127.0.0.1';
}

export async function POST(request: NextRequest) {
  try {
    const { rideId, email, name } = await request.json();

    if (!rideId) {
      return NextResponse.json({ error: 'Yolculuk ID gerekli' }, { status: 400 });
    }

    // Yolculuğu ve ödeme bilgilerini kontrol et
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        request: {
          include: {
            customer: true,
          },
        },
        payment: true,
      },
    });

    if (!ride) {
      return NextResponse.json({ error: 'Yolculuk bulunamadı' }, { status: 404 });
    }

    if (!ride.payment) {
      return NextResponse.json({ error: 'Ödeme kaydı bulunamadı' }, { status: 404 });
    }

    if (ride.payment.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Bu yolculuk için ödeme zaten tamamlandı' }, { status: 400 });
    }

    const merchantId = process.env.PAYTR_MERCHANT_ID!;
    const merchantKey = process.env.PAYTR_MERCHANT_KEY!;
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT!;

    if (!merchantId || !merchantKey || !merchantSalt) {
      return NextResponse.json({ error: 'PayTR yapılandırması eksik' }, { status: 500 });
    }

    // PayTR IPv4 gerektirir
    let userIp = getClientIP(request);
    if (userIp.startsWith('::ffff:')) userIp = userIp.slice(7);
    if (userIp === '::1' || userIp === '127.0.0.1' || !userIp.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      userIp = '1.2.3.4';
    }

    // merchant_oid: RIDE_{rideId}_{timestamp}
    const merchantOid = `RIDE_${rideId}_${Date.now()}`;
    const paymentAmount = String(Math.round(ride.payment.amount * 100)); // Kuruş cinsinden
    const paymentType = 'card';
    const currency = 'TL';
    const testMode = process.env.PAYTR_TEST_MODE === '1' ? '1' : '0';
    const nonThreeD = '0';

    const userBasket = Buffer.from(
      JSON.stringify([['GetDriver Yolculuk', ride.payment.amount.toFixed(2), 1]])
    ).toString('base64');

    const noInstallment = '0';
    const maxInstallment = '0';

    // PayTR hash string
    const hashStr = `${merchantId}${userIp}${merchantOid}${email || ride.request.customer.email || 'test@test.com'}${paymentAmount}${userBasket}${noInstallment}${maxInstallment}${currency}${testMode}`;
    
    const paytrToken = crypto
      .createHmac('sha256', merchantKey)
      .update(hashStr + merchantSalt)
      .digest('base64');

    const params = new URLSearchParams({
      merchant_id: merchantId,
      user_ip: userIp,
      merchant_oid: merchantOid,
      email: email || ride.request.customer.email || 'test@test.com',
      payment_amount: paymentAmount,
      paytr_token: paytrToken,
      user_basket: userBasket,
      debug_on: testMode === '1' ? '1' : '0',
      no_installment: noInstallment,
      max_installment: maxInstallment,
      user_name: name || ride.request.customer.name || 'Müşteri',
      user_address: 'Türkiye',
      user_phone: ride.request.customer.phone || '05000000000',
      merchant_ok_url: `${process.env.NEXTAUTH_URL}/api/payment/callback`,
      merchant_fail_url: `${process.env.NEXTAUTH_URL}/api/payment/callback`,
      timeout_limit: '30',
      currency,
      test_mode: testMode,
      payment_type: paymentType,
      installment_count: '0',
      non_3d: nonThreeD,
    });

    const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const data = await response.json();

    if (data.status === 'success') {
      // merchant_oid ve ride ilişkisini kaydet
      await prisma.payment.update({
        where: { id: ride.payment.id },
        data: {
          providerRef: merchantOid,
        },
      });

      return NextResponse.json({ 
        token: data.token, 
        merchantOid,
        iframeUrl: `https://www.paytr.com/odeme/guvenli/${data.token}`
      });
    } else {
      console.error('PayTR token error:', JSON.stringify(data));
      return NextResponse.json({
        error: data.reason || 'Token alınamadı',
        debug: data,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Payment create error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
