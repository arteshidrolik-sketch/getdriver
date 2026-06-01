export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// POST /api/rides/location/update - Sürücü konumunu güncelle
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { rideId, lat, lng } = body;

    if (!rideId || lat === undefined || lng === undefined) {
      return NextResponse.json(
        { error: "Eksik parametreler" },
        { status: 400 }
      );
    }

    // Sürücüyü bul
    const driver = await prisma.driver.findUnique({
      where: { userId },
    });

    if (!driver) {
      return NextResponse.json({ error: "Sürücü bulunamadı" }, { status: 404 });
    }

    // Yolculuğu kontrol et
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: { request: true },
    });

    if (!ride) {
      return NextResponse.json({ error: "Yolculuk bulunamadı" }, { status: 404 });
    }

    if (ride.driverId !== driver.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    // Sürücü konumunu güncelle
    await prisma.driver.update({
      where: { id: driver.id },
      data: {
        currentLat: lat,
        currentLng: lng,
        lastLocationUpdate: new Date(),
      },
    });

    // Yolculuk rotasına ekle (opsiyonel - geçmiş rotayı kaydetmek için)
    // Şimdilik sadece sürücü konumunu güncelliyoruz

    // Müşteriye bildirim gönder
    try {
      const { sendPushNotification } = await import("@/lib/push-notification");
      await sendPushNotification(ride.request.customerId, {
        title: "🚗 Sürücü Konumu Güncellendi",
        body: "Sürücünüz yola devam ediyor...",
        url: `/musteri/yolculuk/${rideId}`,
        tag: `location-${rideId}`,
      });
    } catch (pushError) {
      console.error("Push notification error:", pushError);
    }

    return NextResponse.json({
      success: true,
      message: "Konum güncellendi",
    });
  } catch (error) {
    console.error("Update location error:", error);
    return NextResponse.json(
      { error: "Konum güncellenemedi" },
      { status: 500 }
    );
  }
}
