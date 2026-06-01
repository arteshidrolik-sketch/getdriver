export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// POST /api/rides/reservation/no-show - Sürücü gelmedi (no-show)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json(
        { error: "Talep ID gerekli" },
        { status: 400 }
      );
    }

    // Rezervasyonu kontrol et
    const rideRequest = await prisma.rideRequest.findUnique({
      where: { id: requestId },
      include: {
        offers: {
          where: { status: "ACCEPTED" },
          include: { driver: true },
        },
        paymentMethod: true,
        ride: true,
      },
    });

    if (!rideRequest) {
      return NextResponse.json(
        { error: "Rezervasyon bulunamadı" },
        { status: 404 }
      );
    }

    // Yetki kontrolü
    if (rideRequest.customerId !== userId) {
      return NextResponse.json(
        { error: "Yetkisiz" },
        { status: 403 }
      );
    }

    // Rezervasyon kontrolü
    if (!rideRequest.isReservation) {
      return NextResponse.json(
        { error: "Bu bir rezervasyon değil" },
        { status: 400 }
      );
    }

    // Kabul edilmiş teklif var mı?
    if (rideRequest.offers.length === 0) {
      return NextResponse.json(
        { error: "Henüz kabul edilmiş bir sürücü yok" },
        { status: 400 }
      );
    }

    const acceptedOffer = rideRequest.offers[0];

    // Yolculuk başlamış mı kontrol et
    if (rideRequest.ride) {
      return NextResponse.json(
        { error: "Yolculuk başladığı için bu işlem yapılamaz" },
        { status: 400 }
      );
    }

    // Rezervasyon zamanı geçti mi?
    const now = new Date();
    const scheduledAt = rideRequest.scheduledAt;
    
    if (scheduledAt && now < scheduledAt) {
      return NextResponse.json(
        { error: "Rezervasyon zamanı henüz gelmedi" },
        { status: 400 }
      );
    }

    // No-show işlemi
    const penaltyAmount = rideRequest.penaltyAmount || 0;
    const preAuthAmount = rideRequest.preAuthAmount || 0;
    const refundAmount = preAuthAmount - penaltyAmount;

    await prisma.$transaction([
      // Rezervasyonu expired olarak işaretle
      prisma.rideRequest.update({
        where: { id: requestId },
        data: { 
          status: "EXPIRED",
          updatedAt: new Date(),
        },
      }),
      
      // Sürücüye ceza kaydet (driver modeline penalty alanı eklenebilir)
      // Şimdilik sadece logluyoruz
      
      // Teklifi reddet
      prisma.rideOffer.update({
        where: { id: acceptedOffer.id },
        data: { status: "REJECTED" },
      }),
    ]);

    console.log(`[NoShow] Sürücü gelmedi işlemi - Request: ${requestId}, Sürücü: ${acceptedOffer.driverId}`);
    console.log(`[NoShow] Ceza: ${penaltyAmount} TL, İade: ${refundAmount} TL`);

    // Sürücüye bildirim gönder
    try {
      const { sendPushNotification } = await import("@/lib/push-notification");
      await sendPushNotification(acceptedOffer.driver.userId, {
        title: "⚠️ Rezervasyon İptal",
        body: "Rezervasyona gitmediğiniz için ceza uygulandı.",
        url: `/surucu`,
      });
    } catch (pushError) {
      console.error("[NoShow] Push notification error:", pushError);
    }

    return NextResponse.json({
      success: true,
      message: "Sürücü gelmediği kaydedildi",
      penaltyAmount,
      refundAmount,
      totalAmount: preAuthAmount,
    });
  } catch (error) {
    console.error("No-show error:", error);
    return NextResponse.json(
      { error: "İşlem başarısız" },
      { status: 500 }
    );
  }
}
