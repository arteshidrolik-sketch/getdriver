export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// GET /api/rides/location/get - Sürücü konumunu getir
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const rideId = searchParams.get("rideId");

    if (!rideId) {
      return NextResponse.json(
        { error: "Yolculuk ID gerekli" },
        { status: 400 }
      );
    }

    // Yolculuğu getir
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        driver: true,
        request: true,
      },
    });

    if (!ride) {
      return NextResponse.json({ error: "Yolculuk bulunamadı" }, { status: 404 });
    }

    // Yetki kontrolü - müşteri veya sürücü olabilir
    const isCustomer = ride.request.customerId === userId;
    const driver = await prisma.driver.findUnique({ where: { userId } });
    const isDriver = driver && ride.driverId === driver.id;

    if (!isCustomer && !isDriver) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    // Sürücü konumunu getir
    const driverLocation = {
      lat: ride.driver.currentLat,
      lng: ride.driver.currentLng,
      lastUpdate: ride.driver.lastLocationUpdate,
    };

    // Alış ve varış noktaları
    const pickupLocation = {
      lat: ride.request.pickupLat,
      lng: ride.request.pickupLng,
      address: ride.request.pickupAddress,
    };

    const dropoffLocation = {
      lat: ride.request.dropoffLat,
      lng: ride.request.dropoffLng,
      address: ride.request.dropoffAddress,
    };

    return NextResponse.json({
      success: true,
      driverLocation,
      pickupLocation,
      dropoffLocation,
      rideStatus: ride.status,
    });
  } catch (error) {
    console.error("Get location error:", error);
    return NextResponse.json(
      { error: "Konum getirilemedi" },
      { status: 500 }
    );
  }
}
