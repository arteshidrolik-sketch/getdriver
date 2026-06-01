export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const vehicles = await prisma.vehicle.findMany({
      where: { userId },
      orderBy: { isDefault: "desc" },
    });

    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error("Get vehicles error:", error);
    return NextResponse.json(
      { error: "Araçlar getirilemedi" },
      { status: 500 }
    );
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
    const { plate, brand, model, year, color, ruhsatPhoto, isDefault } = body;

    if (!plate || !brand || !model) {
      return NextResponse.json(
        { error: "Plaka, marka ve model zorunludur" },
        { status: 400 }
      );
    }

    // If this is default, unset others
    if (isDefault) {
      await prisma.vehicle.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        userId,
        plate: plate.toUpperCase(),
        brand,
        model,
        year: year ? parseInt(year) : null,
        color,
        ruhsatPhoto,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json({
      success: true,
      vehicle,
    });
  } catch (error) {
    console.error("Create vehicle error:", error);
    return NextResponse.json(
      { error: "Araç eklenemedi" },
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
    const vehicleId = searchParams.get("id");

    if (!vehicleId) {
      return NextResponse.json(
        { error: "Araç ID gerekli" },
        { status: 400 }
      );
    }

    // Verify ownership
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, userId },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Araç bulunamadı" },
        { status: 404 }
      );
    }

    await prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete vehicle error:", error);
    return NextResponse.json(
      { error: "Araç silinemedi" },
      { status: 500 }
    );
  }
}