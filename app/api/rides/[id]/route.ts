import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { maskPhone } from "@/lib/utils";

// Helper to mask user phone in response
function maskUserPhone(user: any) {
  if (!user) return user;
  return {
    ...user,
    phone: user.phone ? maskPhone(user.phone) : null,
    maskedPhone: true // Flag to indicate phone is masked
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const ride = await prisma.ride.findUnique({
      where: { id: params.id },
      include: {
        request: {
          include: {
            customer: true,
            vehicle: true
          }
        },
        offer: true,
        driver: {
          include: {
            user: true
          }
        },
        photos: true,
        payment: true,
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ride) {
      return NextResponse.json({ error: "Yolculuk bulunamadı" }, { status: 404 });
    }

    // Check authorization - either customer or driver
    const isCustomer = ride.request.customerId === userId;
    const isDriver = ride.driver?.userId === userId; // Driver table's userId, not driverId

    if (!isCustomer && !isDriver) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    // Mask phone numbers - user should use in-app messaging
    const maskedRide = {
      ...ride,
      request: {
        ...ride.request,
        customer: maskUserPhone(ride.request.customer)
      },
      driver: ride.driver ? {
        ...ride.driver,
        user: maskUserPhone(ride.driver.user)
      } : null
    };

    return NextResponse.json({ ride: maskedRide });
  } catch (error) {
    console.error("Ride fetch error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// Update ride status (for drivers)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { status, cancellationReason, photoUrl, photoType } = body;

    const ride = await prisma.ride.findUnique({
      where: { id: params.id },
      include: {
        driver: true,
        request: true
      }
    });

    if (!ride) {
      return NextResponse.json({ error: "Yolculuk bulunamadı" }, { status: 404 });
    }

    // Only driver can update ride status
    if (ride.driver?.userId !== userId) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    // Handle photo upload
    if (photoUrl && photoType) {
      await prisma.ridePhoto.create({
        data: {
          rideId: ride.id,
          type: photoType,
          photoUrl
        }
      });
    }

    // Handle status update
    if (status) {
      const updateData: any = { status };

      if (status === "IN_PROGRESS") {
        updateData.startedAt = new Date();
      }

      if (status === "COMPLETED") {
        updateData.completedAt = new Date();

        // Update driver stats
        await prisma.driver.update({
          where: { userId },
          data: {
            totalRides: { increment: 1 },
            totalEarnings: { increment: ride.driverAmount }
          }
        });

        // Update payment status
        await prisma.payment.updateMany({
          where: { rideId: ride.id },
          data: {
            status: "COMPLETED",
            paidAt: new Date()
          }
        });
      }

      if (status === "CANCELLED") {
        updateData.cancelledAt = new Date();
        updateData.cancelledBy = userId;
        updateData.cancellationReason = cancellationReason;

        // Update request status
        await prisma.rideRequest.update({
          where: { id: ride.requestId },
          data: { status: "CANCELLED" }
        });
      }

      await prisma.ride.update({
        where: { id: params.id },
        data: updateData
      });
    }

    // Fetch updated ride
    const updatedRide = await prisma.ride.findUnique({
      where: { id: params.id },
      include: {
        request: {
          include: {
            customer: true,
            vehicle: true
          }
        },
        driver: {
          include: {
            user: true
          }
        },
        photos: true,
        payment: true,
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // Mask phone numbers
    const maskedRide = updatedRide ? {
      ...updatedRide,
      request: {
        ...updatedRide.request,
        customer: maskUserPhone(updatedRide.request.customer)
      },
      driver: updatedRide.driver ? {
        ...updatedRide.driver,
        user: maskUserPhone(updatedRide.driver.user)
      } : null
    } : null;

    return NextResponse.json({ ride: maskedRide });
  } catch (error) {
    console.error("Ride update error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
