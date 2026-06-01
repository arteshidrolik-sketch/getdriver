export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { calculateDistance } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const lat = latParam ? parseFloat(latParam) : null;
    const lng = lngParam ? parseFloat(lngParam) : null;
    const radiusKm = parseFloat(searchParams.get("radius") || "50");

    const driver = await prisma.driver.findUnique({
      where: { userId },
    });

    if (!driver || driver.approvalStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "Sürücü hesabınız onaylı değil" },
        { status: 403 }
      );
    }

    // Get active requests
    const requests = await prisma.rideRequest.findMany({
      where: {
        status: "ACTIVE",
        expiresAt: { gt: new Date() },
      },
      include: {
        customer: {
          select: { name: true, profilePhoto: true },
        },
        vehicle: true,
        offers: {
          where: { driverId: driver.id },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter by distance if location provided
    let filteredRequests = requests;
    if (lat !== null && lng !== null && lat !== 0 && lng !== 0) {
      filteredRequests = requests.filter((r) => {
        const distance = calculateDistance(lat, lng, r.pickupLat, r.pickupLng);
        return distance <= radiusKm;
      });
    }

    // Add distance info and check driver's pending offers
    const requestsWithDistance = filteredRequests.map((r) => {
      const myPendingOffer = r.offers.find((o: any) => o.driverId === driver.id && o.status === "PENDING");
      return {
        ...r,
        distance: (lat !== null && lng !== null && lat !== 0 && lng !== 0)
          ? calculateDistance(lat, lng, r.pickupLat, r.pickupLng)
          : null,
        alreadyOffered: r.offers.length > 0,
        myPendingOffer: myPendingOffer || null,
      };
    });

    return NextResponse.json({ requests: requestsWithDistance });
  } catch (error) {
    console.error("Get driver requests error:", error);
    return NextResponse.json(
      { error: "Talepler getirilemedi" },
      { status: 500 }
    );
  }
}