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
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: "desc" },
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Get addresses error:", error);
    return NextResponse.json({ error: "Adresler getirilemedi" }, { status: 500 });
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
    const { title, address, lat, lng, isDefault } = body;

    if (!title || !address) {
      return NextResponse.json({ error: "Gerekli alanlar eksik" }, { status: 400 });
    }

    // If setting as default, unset others
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    // Check if it's the first address
    const existingCount = await prisma.address.count({ where: { userId } });
    const shouldBeDefault = isDefault || existingCount === 0;

    const newAddress = await prisma.address.create({
      data: {
        userId,
        title,
        address,
        lat: lat || 41.0082,
        lng: lng || 28.9784,
        isDefault: shouldBeDefault,
      },
    });

    return NextResponse.json({ success: true, address: newAddress });
  } catch (error) {
    console.error("Add address error:", error);
    return NextResponse.json({ error: "Adres eklenemedi" }, { status: 500 });
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    // Verify ownership
    const address = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!address) {
      return NextResponse.json({ error: "Adres bulunamadı" }, { status: 404 });
    }

    await prisma.address.delete({ where: { id } });

    // If deleted was default, make another one default
    if (address.isDefault) {
      const firstAddress = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });
      if (firstAddress) {
        await prisma.address.update({
          where: { id: firstAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete address error:", error);
    return NextResponse.json({ error: "Adres silinemedi" }, { status: 500 });
  }
}
