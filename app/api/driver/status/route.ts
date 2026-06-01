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
    const { isOnline, lat, lng } = await request.json();

    const driver = await prisma.driver.findUnique({
      where: { userId },
    });

    if (!driver) {
      return NextResponse.json(
        { error: "Sürücü bulunamadı" },
        { status: 404 }
      );
    }

    if (driver.approvalStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "Hesabınız henüz onaylı değil" },
        { status: 403 }
      );
    }

    await prisma.driver.update({
      where: { userId },
      data: {
        isOnline,
        ...(lat && lng && {
          currentLat: lat,
          currentLng: lng,
          lastLocationUpdate: new Date(),
        }),
      },
    });

    return NextResponse.json({ success: true, isOnline });
  } catch (error) {
    console.error("Update driver status error:", error);
    return NextResponse.json(
      { error: "Durum güncellenemedi" },
      { status: 500 }
    );
  }
}