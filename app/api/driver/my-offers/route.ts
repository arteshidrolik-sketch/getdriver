export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// GET /api/driver/my-offers - Sürücünün kendi tekliflerini getir
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const driver = await prisma.driver.findUnique({
      where: { userId },
    });

    if (!driver) {
      return NextResponse.json(
        { error: "Sürücü bulunamadı" },
        { status: 404 }
      );
    }

    const offers = await prisma.rideOffer.findMany({
      where: {
        driverId: driver.id,
      },
      include: {
        request: {
          include: {
            customer: {
              select: { name: true, profilePhoto: true },
            },
            vehicle: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ offers });
  } catch (error) {
    console.error("Get my offers error:", error);
    return NextResponse.json(
      { error: "Teklifler getirilemedi" },
      { status: 500 }
    );
  }
}
