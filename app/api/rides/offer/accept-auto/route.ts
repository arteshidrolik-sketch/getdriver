export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// POST /api/rides/offer/accept-auto - Sürücü otomatik teklifi kabul eder
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
      return NextResponse.json({ error: "Talep ID gerekli" }, { status: 400 });
    }

    // Sürücüyü bul
    const driver = await prisma.driver.findUnique({
      where: { userId },
    });

    if (!driver) {
      return NextResponse.json({ error: "Sürücü bulunamadı" }, { status: 404 });
    }

    // Teklifi bul
    const offer = await prisma.rideOffer.findFirst({
      where: {
        requestId,
        driverId: driver.id,
        status: "PENDING",
      },
      include: {
        request: true,
      },
    });

    if (!offer) {
      return NextResponse.json(
        { error: "Aktif teklif bulunamadı" },
        { status: 404 }
      );
    }

    if (offer.request.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Talep artık aktif değil" },
        { status: 400 }
      );
    }

    // Komisyon oranını al
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "settings" },
    });
    const commissionRate = settings?.commissionRate || 0.2;
    const platformFee = offer.price * commissionRate;
    const driverAmount = offer.price - platformFee;

    // Yolculuk oluştur ve durumları güncelle
    const ride = await prisma.$transaction(async (tx) => {
      // Yolculuk oluştur
      const newRide = await tx.ride.create({
        data: {
          requestId: offer.requestId,
          offerId: offer.id,
          driverId: driver.id,
          price: offer.price,
          platformFee,
          driverAmount,
          status: "PENDING_PICKUP",
        },
      });

      // Talep durumunu güncelle
      await tx.rideRequest.update({
        where: { id: offer.requestId },
        data: { status: "ACCEPTED" },
      });

      // Bu teklifi kabul et
      await tx.rideOffer.update({
        where: { id: offer.id },
        data: { status: "ACCEPTED" },
      });

      // Diğer teklifleri reddet
      await tx.rideOffer.updateMany({
        where: {
          requestId: offer.requestId,
          id: { not: offer.id },
          status: "PENDING",
        },
        data: { status: "REJECTED" },
      });

      // Ödeme kaydı oluştur
      await tx.payment.create({
        data: {
          rideId: newRide.id,
          amount: offer.price,
          platformFee,
          driverAmount,
          status: "PRE_AUTH",
          preAuthRef: `PREAUTH_${newRide.id}`,
        },
      });

      return newRide;
    });

    // Müşteriye bildirim gönder
    try {
      const { sendPushNotification } = await import("@/lib/push-notification");
      await sendPushNotification(offer.request.customerId, {
        title: "🚗 Sürücü Bulundu!",
        body: "Sürücünüz yola çıktı. Takip etmek için tıklayın.",
        url: `/musteri/yolculuk/${ride.id}`,
        tag: `ride-${ride.id}`,
      });
    } catch (pushError) {
      console.error("Push notification error:", pushError);
    }

    return NextResponse.json({
      success: true,
      rideId: ride.id,
      message: "Yolculuk başladı",
    });
  } catch (error) {
    console.error("Accept auto offer error:", error);
    return NextResponse.json(
      { error: "Teklif kabul edilemedi" },
      { status: 500 }
    );
  }
}
