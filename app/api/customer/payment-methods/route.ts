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
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: { isDefault: "desc" },
    });

    return NextResponse.json({ paymentMethods });
  } catch (error) {
    console.error("Get payment methods error:", error);
    return NextResponse.json({ error: "Ödeme yöntemleri getirilemedi" }, { status: 500 });
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
    const { cardLast4, cardBrand, cardHolder, isDefault } = body;

    if (!cardLast4 || !cardHolder) {
      return NextResponse.json({ error: "Gerekli alanlar eksik" }, { status: 400 });
    }

    // If setting as default, unset others
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    // Check if it's the first card
    const existingCount = await prisma.paymentMethod.count({ where: { userId } });
    const shouldBeDefault = isDefault || existingCount === 0;

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId,
        cardLast4,
        cardBrand: cardBrand || "Kart",
        cardHolder,
        isDefault: shouldBeDefault,
      },
    });

    return NextResponse.json({ success: true, paymentMethod });
  } catch (error) {
    console.error("Add payment method error:", error);
    return NextResponse.json({ error: "Ödeme yöntemi eklenemedi" }, { status: 500 });
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
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { id, userId },
    });

    if (!paymentMethod) {
      return NextResponse.json({ error: "Ödeme yöntemi bulunamadı" }, { status: 404 });
    }

    await prisma.paymentMethod.delete({ where: { id } });

    // If deleted was default, make another one default
    if (paymentMethod.isDefault) {
      const firstCard = await prisma.paymentMethod.findFirst({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });
      if (firstCard) {
        await prisma.paymentMethod.update({
          where: { id: firstCard.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete payment method error:", error);
    return NextResponse.json({ error: "Ödeme yöntemi silinemedi" }, { status: 500 });
  }
}
