export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

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