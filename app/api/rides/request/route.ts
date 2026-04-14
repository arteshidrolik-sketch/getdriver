export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { calculateDistance } from "@/lib/utils";

// En yakın online sürücüleri bul ve bildirim gönder
async function findAndNotifyNearbyDrivers(rideRequest: any) {
  const { pickupLat, pickupLng, id: requestId, pickupAddress, dropoffAddress } = rideRequest;

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
    console.log("[DriverMatch] Online sürücü bulunamadı");
    return;
  }

  // Mesafeye göre sırala (en yakın ilk)
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
    .filter((d) => d.distance <= 50) // 50km yarıçap
    .sort((a, b) => a.distance - b.distance);

  if (driversWithDistance.length === 0) {
    console.log("[DriverMatch] 50km içinde sürücü bulunamadı");
    return;
  }

  console.log(`[DriverMatch] ${driversWithDistance.length} sürücü bulundu`);

  // İlk 5 sürücüye bildirim gönder (broadcast mantığı)
  const topDrivers = driversWithDistance.slice(0, 5);

  for (const driver of topDrivers) {
    try {
      // Push notification gönder
      const { sendPushNotification } = await import("@/lib/push-notification");
      await sendPushNotification(driver.user.id, {
        title: "🚗 Yeni Talep!",
        body: `${pickupAddress} → ${dropoffAddress} | ${driver.distance.toFixed(1)} km uzakta`,
        url: `/surucu/talepler`,
        tag: `request-${requestId}`,
        actions: [{ action: "view", title: "Görüntüle" }],
      });

      console.log(`[DriverMatch] Bildirim gönderildi: ${driver.user.name} (${driver.distance.toFixed(1)} km)`);
    } catch (error) {
      console.error(`[DriverMatch] Bildirim hatası (${driver.user.name}):`, error);
    }
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const {
      vehicleId,
      paymentMethodId,
      pickupLat,
      pickupLng,
      pickupAddress,
      dropoffLat,
      dropoffLng,
      dropoffAddress,
      notes,
    } = body;

    // Validate vehicle ownership
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, userId },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Araç bulunamadı" },
        { status: 400 }
      );
    }

    // Validate payment method ownership
    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "Ödeme yöntemi gerekli" },
        { status: 400 }
      );
    }

    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { id: paymentMethodId, userId },
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Geçersiz ödeme yöntemi" },
        { status: 400 }
      );
    }

    // Check for existing active requests
    const existingRequest = await prisma.rideRequest.findFirst({
      where: {
        customerId: userId,
        status: "ACTIVE",
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "Zaten aktif bir talebiniz var" },
        { status: 400 }
      );
    }

    // Get system settings
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "settings" },
    });

    const expiresAt = new Date(
      Date.now() + (settings?.maxOfferWaitMin || 15) * 60 * 1000
    );

    const rideRequest = await prisma.rideRequest.create({
      data: {
        customerId: userId,
        vehicleId,
        paymentMethodId,
        pickupLat,
        pickupLng,
        pickupAddress,
        dropoffLat,
        dropoffLng,
        dropoffAddress,
        notes,
        status: "ACTIVE",
        expiresAt,
      },
    });

    // En yakın online sürücüleri bul ve bildirim gönder
    try {
      await findAndNotifyNearbyDrivers(rideRequest);
    } catch (notifyError) {
      console.error("Driver notification error:", notifyError);
      // Bildirim hatası talebi engellemesin
    }

    return NextResponse.json({
      success: true,
      requestId: rideRequest.id,
    });
  } catch (error) {
    console.error("Create request error:", error);
    return NextResponse.json(
      { error: "Talep oluşturulamadı" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const requests = await prisma.rideRequest.findMany({
      where: {
        customerId: userId,
        ...(status && { status: status as any }),
      },
      include: {
        vehicle: true,
        offers: {
          include: {
            driver: {
              include: { user: true },
            },
          },
        },
        ride: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Get requests error:", error);
    return NextResponse.json(
      { error: "Talepler getirilemedi" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("id");

    if (!requestId) {
      return NextResponse.json(
        { error: "Talep ID gerekli" },
        { status: 400 }
      );
    }

    // Find the request and check ownership
    const rideRequest = await prisma.rideRequest.findUnique({
      where: { id: requestId },
      include: {
        offers: true,
      },
    });

    if (!rideRequest) {
      return NextResponse.json(
        { error: "Talep bulunamadı" },
        { status: 404 }
      );
    }

    if (rideRequest.customerId !== userId) {
      return NextResponse.json(
        { error: "Bu talebi silme yetkiniz yok" },
        { status: 403 }
      );
    }

    // Check if any offer has been accepted
    const hasAcceptedOffer = rideRequest.offers.some(
      (offer) => offer.status === "ACCEPTED"
    );

    if (hasAcceptedOffer || rideRequest.status === "ACCEPTED") {
      return NextResponse.json(
        { error: "Kabul edilmiş bir teklif olduğu için talep silinemez" },
        { status: 400 }
      );
    }

    // Can only cancel ACTIVE requests
    if (rideRequest.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Sadece aktif talepler iptal edilebilir" },
        { status: 400 }
      );
    }

    // Cancel the request and reject all pending offers
    await prisma.$transaction([
      prisma.rideRequest.update({
        where: { id: requestId },
        data: { status: "CANCELLED" },
      }),
      prisma.rideOffer.updateMany({
        where: {
          requestId: requestId,
          status: "PENDING",
        },
        data: { status: "REJECTED" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Talep başarıyla iptal edildi",
    });
  } catch (error) {
    console.error("Delete request error:", error);
    return NextResponse.json(
      { error: "Talep iptal edilemedi" },
      { status: 500 }
    );
  }
}