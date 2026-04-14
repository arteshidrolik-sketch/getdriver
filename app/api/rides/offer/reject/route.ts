export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { calculateDistance } from "@/lib/utils";

// POST /api/rides/offer/reject - Sürücü teklifi reddederse sonraki sürücüye git
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { offerId } = body;

    if (!offerId) {
      return NextResponse.json({ error: "Teklif ID gerekli" }, { status: 400 });
    }

    // Teklifi getir
    const offer = await prisma.rideOffer.findUnique({
      where: { id: offerId },
      include: {
        request: true,
        driver: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Teklif bulunamadı" }, { status: 404 });
    }

    // Sürücü kontrolü
    const driver = await prisma.driver.findUnique({
      where: { userId },
    });

    if (!driver || offer.driverId !== driver.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    // Teklif zaten işlenmiş mi?
    if (offer.status !== "PENDING") {
      return NextResponse.json(
        { error: "Bu teklif zaten işlenmiş" },
        { status: 400 }
      );
    }

    const { request } = offer;

    // Teklifi reddet
    await prisma.rideOffer.update({
      where: { id: offerId },
      data: { status: "REJECTED" },
    });

    console.log(`[AutoMatch] Sürücü reddetti: ${offer.driver.user.name}`);

    // Sonraki sürücüyü bul
    const allOffers = await prisma.rideOffer.findMany({
      where: { requestId: request.id },
      select: { driverId: true, status: true },
    });

    const rejectedDriverIds = allOffers
      .filter((o) => o.status === "REJECTED")
      .map((o) => o.driverId);

    // Online sürücüleri bul
    const onlineDrivers = await prisma.driver.findMany({
      where: {
        isOnline: true,
        approvalStatus: "APPROVED",
        currentLat: { not: null },
        currentLng: { not: null },
        id: { notIn: rejectedDriverIds },
      },
      include: {
        user: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    if (onlineDrivers.length === 0) {
      console.log("[AutoMatch] Başka müsait sürücü yok");
      return NextResponse.json({
        success: true,
        message: "Teklif reddedildi, başka sürücü yok",
        nextDriver: null,
      });
    }

    // Mesafeye göre sırala
    const availableDrivers = onlineDrivers
      .map((d) => ({
        ...d,
        distance: calculateDistance(
          request.pickupLat,
          request.pickupLng,
          d.currentLat!,
          d.currentLng!
        ),
      }))
      .filter((d) => d.distance <= 50)
      .sort((a, b) => a.distance - b.distance);

    if (availableDrivers.length === 0) {
      console.log("[AutoMatch] 50km içinde başka sürücü yok");
      return NextResponse.json({
        success: true,
        message: "Teklif reddedildi, yakında başka sürücü yok",
        nextDriver: null,
      });
    }

    // Sonraki sürücüye teklif gönder
    const nextDriver = availableDrivers[0];

    const settings = await prisma.systemSettings.findUnique({
      where: { id: "settings" },
    });
    const minFare = settings?.minFare || 100;
    const estimatedPrice = Math.max(minFare, Math.round(nextDriver.distance * 15));

    const newOffer = await prisma.rideOffer.create({
      data: {
        requestId: request.id,
        driverId: nextDriver.id,
        price: estimatedPrice,
        estimatedArrival: Math.max(5, Math.round(nextDriver.distance * 2)),
        message: "Otomatik eşleştirme (sonraki sürücü)",
        status: "PENDING",
      },
    });

    console.log(`[AutoMatch] Sonraki sürücüye teklif: ${nextDriver.user.name}`);
    console.log(`[AutoMatch] Mesafe: ${nextDriver.distance.toFixed(1)} km`);

    // Bildirim gönder
    try {
      const { sendPushNotification } = await import("@/lib/push-notification");
      await sendPushNotification(nextDriver.user.id, {
        title: "🚗 Yeni Talep!",
        body: `${request.pickupAddress} → ${request.dropoffAddress}`,
        url: `/surucu/talepler`,
        tag: `auto-offer-${newOffer.id}`,
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
      message: "Teklif reddedildi, sonraki sürücüye gönderildi",
      nextDriver: {
        name: nextDriver.user.name,
        distance: nextDriver.distance,
        price: estimatedPrice,
      },
    });
  } catch (error) {
    console.error("Reject offer error:", error);
    return NextResponse.json(
      { error: "Teklif reddedilemedi" },
      { status: 500 }
    );
  }
}
