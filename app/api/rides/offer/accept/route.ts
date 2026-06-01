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
    const { offerId } = await request.json();

    // Get offer with request
    const offer = await prisma.rideOffer.findUnique({
      where: { id: offerId },
      include: {
        request: true,
        driver: true,
      },
    });

    if (!offer) {
      return NextResponse.json(
        { error: "Teklif bulunamadı" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (offer.request.customerId !== userId) {
      return NextResponse.json(
        { error: "Yetkisiz işlem" },
        { status: 403 }
      );
    }

    if (offer.request.status !== "ACTIVE" || offer.status !== "PENDING") {
      return NextResponse.json(
        { error: "Bu teklif artık geçerli değil" },
        { status: 400 }
      );
    }

    // Get commission rate
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "settings" },
    });
    const commissionRate = settings?.commissionRate || 0.2;
    const platformFee = offer.price * commissionRate;
    const driverAmount = offer.price - platformFee;

    // Create ride and update statuses in transaction
    const ride = await prisma.$transaction(async (tx) => {
      // Create the ride first
      const newRide = await tx.ride.create({
        data: {
          requestId: offer.requestId,
          offerId: offer.id,
          driverId: offer.driverId,
          price: offer.price,
          platformFee,
          driverAmount,
          status: "PENDING_PICKUP",
        },
      });

      // Update request status
      await tx.rideRequest.update({
        where: { id: offer.requestId },
        data: { status: "ACCEPTED" },
      });

      // Accept this offer
      await tx.rideOffer.update({
        where: { id: offerId },
        data: { status: "ACCEPTED" },
      });

      // Reject other offers
      await tx.rideOffer.updateMany({
        where: {
          requestId: offer.requestId,
          id: { not: offerId },
          status: "PENDING",
        },
        data: { status: "REJECTED" },
      });

      // Create payment record with correct ride ID
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

    return NextResponse.json({
      success: true,
      rideId: ride.id,
    });
  } catch (error) {
    console.error("Accept offer error:", error);
    return NextResponse.json(
      { error: "Teklif kabul edilemedi" },
      { status: 500 }
    );
  }
}