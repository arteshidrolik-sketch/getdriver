export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { calculateDistance } from "@/lib/utils";

// POST /api/rides/offer/create - Otomatik sürücü eşleştirme
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

    // Talebi getir
    const rideRequest = await prisma.rideRequest.findUnique({
      where: { id: requestId },
      include: {
        customer: true,
        vehicle: true,
        offers: true,
      },
    });

    if (!rideRequest || rideRequest.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Talep bulunamadı veya aktif değil" },
        { status: 400 }
      );
    }

    // Müşteri kontrolü
    if (rideRequest.customerId !== userId) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    // Zaten kabul edilmiş teklif var mı?
    const acceptedOffer = rideRequest.offers.find((o) => o.status === "ACCEPTED");
    if (acceptedOffer) {
      return NextResponse.json({
        success: true,
        message: "Zaten kabul edilmiş teklif var",
        offerId: acceptedOffer.id,
      });
    }

    // Online sürücüleri bul
    const onlineDrivers = await prisma.driver.findMany({
      where: {
        isOnline: true,
        approvalStatus: "APPROVED",
        currentLat: { not: null },
        currentLng: { not: null },
      },
      include: {
        user: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    if (onlineDrivers.length === 0) {
      return NextResponse.json(
        { error: "Şu an müsait sürücü yok" },
        { status: 404 }
      );
    }

    // Mesafeye göre sırala ve reddedilmişleri filtrele
    const rejectedDriverIds = rideRequest.offers
      .filter((o) => o.status === "REJECTED")
      .map((o) => o.driverId);

    const availableDrivers = onlineDrivers
      .filter((d) => !rejectedDriverIds.includes(d.id))
      .map((driver) => ({
        ...driver,
        distance: calculateDistance(
          rideRequest.pickupLat,
          rideRequest.pickupLng,
          driver.currentLat!,
          driver.currentLng!
        ),
      }))
      .filter((d) => d.distance <= 50)
      .sort((a, b) => a.distance - b.distance);

    if (availableDrivers.length === 0) {
      return NextResponse.json(
        { error: "Müsait sürücü kalmadı" },
        { status: 404 }
      );
    }

    // En yakın sürücüye otomatik teklif gönder
    const nearestDriver = availableDrivers[0];

    // Sistem ayarlarından minimum ücret
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "settings" },
    });
    const minFare = settings?.minFare || 100;

    // Mesafeye göre tahmini fiyat (basit hesaplama)
    const estimatedPrice = Math.max(minFare, Math.round(nearestDriver.distance * 15));

    // Teklif oluştur
    const offer = await prisma.rideOffer.create({
      data: {
        requestId,
        driverId: nearestDriver.id,
        price: estimatedPrice,
        estimatedArrival: Math.max(5, Math.round(nearestDriver.distance * 2)),
        message: "Otomatik eşleştirme",
        status: "PENDING",
      },
    });

    // Sürücüye bildirim gönder
    console.log(`[AutoMatch] Sürücüye teklif gönderildi: ${nearestDriver.user.name}`);
    console.log(`[AutoMatch] Mesafe: ${nearestDriver.distance.toFixed(1)} km`);
    console.log(`[AutoMatch] Tahmini fiyat: ${estimatedPrice} TL`);

    try {
      const { sendPushNotification } = await import("@/lib/push-notification");
      await sendPushNotification(nearestDriver.user.id, {
        title: "🚗 Yeni Talep!",
        body: `${rideRequest.pickupAddress} → ${rideRequest.dropoffAddress}`,
        url: `/surucu/talepler`,
        tag: `auto-offer-${offer.id}`,
        actions: [
          { action: "accept", title: "Kabul Et" },
          { action: "reject", title: "Reddet" },
        ],
      });
    } catch (pushError) {
      console.error("[AutoMatch] Push notification error:", pushError);
    }

    return NextResponse.json({
      success: true,
      message: "Sürücüye teklif gönderildi",
      offerId: offer.id,
      driver: {
        name: nearestDriver.user.name,
        distance: nearestDriver.distance,
        price: estimatedPrice,
      },
    });
  } catch (error) {
    console.error("Auto match error:", error);
    return NextResponse.json(
      { error: "Sürücü eşleştirme başarısız" },
      { status: 500 }
    );
  }
}
