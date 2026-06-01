export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { calculateDistance } from "@/lib/utils";

// Rezervasyon hatırlatma bildirimi gönder
async function sendReservationReminder(request: any) {
  try {
    const { id: requestId, pickupAddress, dropoffAddress, pickupLat, pickupLng, scheduledAt } = request;

    // Online ve onaylı sürücüleri bul
    const onlineDrivers = await prisma.driver.findMany({
      where: {
        isOnline: true,
        approvalStatus: "APPROVED",
        currentLat: { not: null },
        currentLng: { not: null },
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    if (onlineDrivers.length === 0) {
      console.log("[ReservationNotify] Online sürücü bulunamadı");
      return { success: false, message: "Online sürücü yok" };
    }

    // Mesafeye göre sırala
    const driversWithDistance = onlineDrivers
      .map((driver) => ({
        ...driver,
        distance: calculateDistance(
          pickupLat,
          pickupLng,
          driver.currentLat!,
          driver.currentLng!
        ),
      }))
      .filter((d) => d.distance <= 50)
      .sort((a, b) => a.distance - b.distance);

    if (driversWithDistance.length === 0) {
      console.log("[ReservationNotify] 50km içinde sürücü bulunamadı");
      return { success: false, message: "Yakında sürücü yok" };
    }

    // İlk 3 sürücüye bildirim gönder
    const topDrivers = driversWithDistance.slice(0, 3);
    const scheduledTime = new Date(scheduledAt).toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    for (const driver of topDrivers) {
      try {
        const { sendPushNotification } = await import("@/lib/push-notification");
        await sendPushNotification(driver.user.id, {
          title: "📅 Rezervasyon Hatırlatma",
          body: `${scheduledTime} için rezervasyon: ${pickupAddress} → ${dropoffAddress}`,
          url: `/surucu/rezervasyonlar`,
          tag: `reservation-${requestId}`,
          actions: [{ action: "view", title: "Görüntüle" }],
        });

        console.log(`[ReservationNotify] Bildirim gönderildi: ${driver.user.name}`);
      } catch (error) {
        console.error(`[ReservationNotify] Bildirim hatası (${driver.user.name}):`, error);
      }
    }

    // Bildirim gönderildi olarak işaretle
    await prisma.rideRequest.update({
      where: { id: requestId },
      data: { notifiedAt: new Date() },
    });

    return { 
      success: true, 
      message: `${topDrivers.length} sürücüye bildirim gönderildi`,
      drivers: topDrivers.map(d => d.user.name)
    };
  } catch (error) {
    console.error("[ReservationNotify] Hata:", error);
    return { success: false, message: "Bildirim gönderilemedi" };
  }
}

// POST /api/rides/reservation/notify - Rezervasyon hatırlatması gönder
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

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
    });

    if (!rideRequest) {
      return NextResponse.json(
        { error: "Rezervasyon bulunamadı" },
        { status: 404 }
      );
    }

    if (!rideRequest.isReservation) {
      return NextResponse.json(
        { error: "Bu bir rezervasyon değil" },
        { status: 400 }
      );
    }

    // Yetki kontrolü
    const userId = (session.user as any).id;
    if (rideRequest.customerId !== userId) {
      return NextResponse.json(
        { error: "Yetkisiz" },
        { status: 403 }
      );
    }

    // Bildirim gönder
    const result = await sendReservationReminder(rideRequest);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Reservation notify error:", error);
    return NextResponse.json(
      { error: "Bildirim gönderilemedi" },
      { status: 500 }
    );
  }
}

// GET /api/rides/reservation/notify - Yaklaşan rezervasyonları kontrol et ve bildirim gönder
export async function GET(request: Request) {
  try {
    // Cron job veya zamanlayıcı tarafından çağrılacak
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    // 1 saat içinde başlayacak ve henüz bildirim gönderilmemiş rezervasyonları bul
    const upcomingReservations = await prisma.rideRequest.findMany({
      where: {
        isReservation: true,
        status: "ACTIVE",
        scheduledAt: {
          gte: now,
          lte: oneHourLater,
        },
        notifiedAt: null,
      },
    });

    console.log(`[ReservationNotify] ${upcomingReservations.length} yaklaşan rezervasyon bulundu`);

    const results = [];
    for (const reservation of upcomingReservations) {
      const result = await sendReservationReminder(reservation);
      results.push({
        requestId: reservation.id,
        ...result,
      });
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("Reservation notify cron error:", error);
    return NextResponse.json(
      { error: "İşlem başarısız" },
      { status: 500 }
    );
  }
}
