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
    const { requestId, price, estimatedArrival, message } = body;

    // Get driver with user info
    const driver = await prisma.driver.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!driver || driver.approvalStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "Sürücü hesabınız onaylı değil" },
        { status: 403 }
      );
    }

    if (!driver.isOnline) {
      return NextResponse.json(
        { error: "Çevrimdışı durumdayıken teklif veremezsiniz" },
        { status: 400 }
      );
    }

    // Check request exists and is active - include customer info
    const rideRequest = await prisma.rideRequest.findUnique({
      where: { id: requestId },
      include: {
        customer: true,
      },
    });

    if (!rideRequest || rideRequest.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Talep bulunamadı veya artık aktif değil" },
        { status: 400 }
      );
    }

    // Check for existing offer
    const existingOffer = await prisma.rideOffer.findUnique({
      where: {
        requestId_driverId: {
          requestId,
          driverId: driver.id,
        },
      },
    });

    if (existingOffer) {
      return NextResponse.json(
        { error: "Bu talebe zaten teklif verdiniz" },
        { status: 400 }
      );
    }

    // Validate minimum price
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "settings" },
    });

    if (price < (settings?.minFare || 100)) {
      return NextResponse.json(
        { error: `Minimum ücret ${settings?.minFare || 100} TL'dir` },
        { status: 400 }
      );
    }

    const offer = await prisma.rideOffer.create({
      data: {
        requestId,
        driverId: driver.id,
        price,
        estimatedArrival,
        message,
        status: "PENDING",
      },
    });

    // Send push notification to customer
    try {
      const { sendPushNotification } = await import("@/lib/push-notification");
      await sendPushNotification(rideRequest.customerId, {
        title: `🚗 Yeni Teklif: ${price} TL`,
        body: `${driver.user.name} (⭐${driver.ratingAvg.toFixed(1)}) size ${price} TL teklif etti. ${estimatedArrival} dk içinde gelecek.`,
        url: `/musteri/talep/${requestId}`,
        tag: `offer-${offer.id}`,
        actions: [
          { action: 'view', title: 'Görüntüle' }
        ]
      });
    } catch (pushError) {
      console.error("Push notification error:", pushError);
      // Don't fail the offer creation if notification fails
    }

    return NextResponse.json({
      success: true,
      offerId: offer.id,
    });
  } catch (error) {
    console.error("Create offer error:", error);
    return NextResponse.json(
      { error: "Teklif oluşturulamadı" },
      { status: 500 }
    );
  }
}