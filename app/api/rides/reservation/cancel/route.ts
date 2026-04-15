export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// POST /api/rides/reservation/cancel - Rezervasyon iptali
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json(
        { error: "Talep ID gerekli" },
        { status: 400 }
      );
    }

    // Rezervasyonu kontrol et
    const rideRequest = await prisma.rideRequest.findUnique({
      where: { id: requestId },
      include: {
        offers: true,
        paymentMethod: true,
      },
    });

    if (!rideRequest) {
      return NextResponse.json(
        { error: "Rezervasyon bulunamadı" },
        { status: 404 }
      );
    }

    // Yetki kontrolü
    if (rideRequest.customerId !== userId) {
      return NextResponse.json(
        { error: "Bu rezervasyonu iptal etme yetkiniz yok" },
        { status: 403 }
      );
    }

    // Rezervasyon kontrolü
    if (!rideRequest.isReservation) {
      return NextResponse.json(
        { error: "Bu bir rezervasyon değil" },
        { status: 400 }
      );
    }

    // İptal hakkı kontrolü
    const now = new Date();
    const cancellationDeadline = rideRequest.cancellationDeadline;
    
    if (cancellationDeadline && now > cancellationDeadline) {
      return NextResponse.json(
        { error: "İptal süresi doldu. Rezervasyonu iptal edemezsiniz." },
        { status: 400 }
      );
    }

    // Kabul edilmiş teklif var mı?
    const hasAcceptedOffer = rideRequest.offers.some(
      (offer) => offer.status === "ACCEPTED"
    );

    if (hasAcceptedOffer) {
      return NextResponse.json(
        { error: "Kabul edilmiş teklif olduğu için rezervasyon iptal edilemez" },
        { status: 400 }
      );
    }

    // İptal işlemi
    await prisma.$transaction([
      // Rezervasyonu iptal et
      prisma.rideRequest.update({
        where: { id: requestId },
        data: { 
          status: "CANCELLED",
          updatedAt: new Date(),
        },
      }),
      
      // Bekleyen teklifleri reddet
      prisma.rideOffer.updateMany({
        where: {
          requestId: requestId,
          status: "PENDING",
        },
        data: { status: "REJECTED" },
      }),
    ]);

    console.log(`[ReservationCancel] Rezervasyon iptal edildi - ID: ${requestId}, Kullanıcı: ${userId}`);

    return NextResponse.json({
      success: true,
      message: "Rezervasyon başarıyla iptal edildi",
      refundAmount: rideRequest.preAuthAmount || 0,
    });
  } catch (error) {
    console.error("Reservation cancel error:", error);
    return NextResponse.json(
      { error: "Rezervasyon iptal edilemedi" },
      { status: 500 }
    );
  }
}
