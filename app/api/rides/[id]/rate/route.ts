export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// POST /api/rides/[id]/rate - Yolculuğu değerlendir
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { score, comment } = await request.json();

    if (!score || score < 1 || score > 5) {
      return NextResponse.json({ error: "Geçerli bir puan girin (1-5)" }, { status: 400 });
    }

    // Yolculuğu getir
    const ride = await prisma.ride.findUnique({
      where: { id: params.id },
      include: {
        driver: { include: { user: true } },
        request: { include: { customer: true } },
      },
    });

    if (!ride) {
      return NextResponse.json({ error: "Yolculuk bulunamadı" }, { status: 404 });
    }

    if (ride.status !== "COMPLETED") {
      return NextResponse.json({ error: "Sadece tamamlanan yolculuklar değerlendirilebilir" }, { status: 400 });
    }

    const isCustomer = ride.request.customerId === userId;
    const isDriver = ride.driver?.userId === userId;

    if (!isCustomer && !isDriver) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    // Daha önce değerlendirme yapılmış mı?
    const toUserId = isCustomer ? ride.driver!.userId : ride.request.customerId;

    const existing = await prisma.rating.findFirst({
      where: { rideId: ride.id, fromUserId: userId },
    });

    if (existing) {
      return NextResponse.json({ error: "Bu yolculuğu zaten değerlendirdiniz" }, { status: 400 });
    }

    // Rating oluştur
    await prisma.rating.create({
      data: {
        rideId: ride.id,
        fromUserId: userId,
        toUserId,
        score,
        comment: comment || null,
      },
    });

    // Sürücünün ortalama puanını güncelle (müşteri değerlendiriyorsa)
    if (isCustomer) {
      const ratings = await prisma.rating.findMany({
        where: { toUserId: ride.driver!.userId },
      });
      const avg = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
      await prisma.driver.update({
        where: { userId: ride.driver!.userId },
        data: {
          ratingAvg: Math.round(avg * 10) / 10,
          ratingCount: ratings.length,
        },
      });
    }

    return NextResponse.json({ success: true, message: "Değerlendirmeniz kaydedildi" });
  } catch (error) {
    console.error("Rating error:", error);
    return NextResponse.json({ error: "Değerlendirme kaydedilemedi" }, { status: 500 });
  }
}

// GET /api/rides/[id]/rate - Bu yolculuk için mevcut değerlendirmeyi getir
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

    const rating = await prisma.rating.findFirst({
      where: { rideId: params.id, fromUserId: userId },
    });

    return NextResponse.json({ rating });
  } catch (error) {
    return NextResponse.json({ error: "Hata" }, { status: 500 });
  }
}
