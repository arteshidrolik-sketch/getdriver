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
    const { rideId, reason } = await request.json();

    if (!rideId) {
      return NextResponse.json({ error: "Yolculuk ID gerekli" }, { status: 400 });
    }

    // Find the ride with request and payment info
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        request: {
          include: {
            paymentMethod: true,
          },
        },
        driver: true,
        payment: true,
      },
    });

    if (!ride) {
      return NextResponse.json({ error: "Yolculuk bulunamadı" }, { status: 404 });
    }

    // Check if customer owns this ride
    if (ride.request.customerId !== userId) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    // Check if ride can be cancelled (before COMPLETED status)
    const nonCancellableStatuses = ["COMPLETED", "CANCELLED", "DISPUTED"];
    if (nonCancellableStatuses.includes(ride.status)) {
      return NextResponse.json(
        { error: "Bu yolculuk iptal edilemez" },
        { status: 400 }
      );
    }

    // Calculate cancellation fee (30% of ride price)
    const cancellationFee = ride.price * 0.3;

    // Update ride status to CANCELLED
    await prisma.$transaction(async (tx) => {
      // Update ride
      await tx.ride.update({
        where: { id: rideId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancelledBy: userId,
          cancellationReason: reason || "Müşteri tarafından iptal edildi",
        },
      });

      // Update ride request status
      await tx.rideRequest.update({
        where: { id: ride.requestId },
        data: { status: "CANCELLED" },
      });

      // Update payment with cancellation fee
      // In a real system, this would charge the customer's card
      // For now, we'll record the cancellation fee
      if (ride.payment) {
        await tx.payment.update({
          where: { id: ride.payment.id },
          data: {
            status: "COMPLETED",
            amount: cancellationFee,
            platformFee: cancellationFee * 0.2, // 20% platform fee from cancellation
            driverAmount: cancellationFee * 0.8, // 80% goes to driver
            paidAt: new Date(),
          },
        });

        // Credit the driver for their inconvenience
        if (ride.driver) {
          await tx.driver.update({
            where: { id: ride.driverId },
            data: {
              totalEarnings: { increment: cancellationFee * 0.8 },
            },
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Yolculuk iptal edildi",
      cancellationFee,
      note: `İptal ücreti olarak ${cancellationFee.toFixed(2)} TL kartınızdan tahsil edilecektir.`,
    });
  } catch (error) {
    console.error("Cancel ride error:", error);
    return NextResponse.json(
      { error: "İptal işlemi sırasında hata oluştu" },
      { status: 500 }
    );
  }
}
