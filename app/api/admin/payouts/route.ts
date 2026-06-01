import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// Get all drivers with payout info
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all"; // all, pending, noIban

    let whereClause: any = {
      approvalStatus: "APPROVED"
    };

    if (filter === "pending") {
      whereClause.pendingPayout = { gt: 0 };
    } else if (filter === "noIban") {
      whereClause.OR = [
        { iban: null },
        { iban: "" }
      ];
    }

    const drivers = await prisma.driver.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        },
        payouts: {
          orderBy: { createdAt: "desc" },
          take: 5
        }
      },
      orderBy: { pendingPayout: "desc" }
    });

    // Calculate summary stats
    const totalPendingPayout = drivers.reduce((sum, d) => sum + d.pendingPayout, 0);
    const driversWithPending = drivers.filter(d => d.pendingPayout > 0).length;
    const driversWithoutIban = drivers.filter(d => !d.iban).length;

    return NextResponse.json({
      drivers,
      stats: {
        totalDrivers: drivers.length,
        totalPendingPayout,
        driversWithPending,
        driversWithoutIban
      }
    });
  } catch (error) {
    console.error("Admin payouts get error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

// Create a payout record (mark payment as completed)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const adminId = (session.user as any).id;
    const { driverId, amount, notes } = await request.json();

    if (!driverId || !amount) {
      return NextResponse.json({ error: "Sürücü ID ve miktar gerekli" }, { status: 400 });
    }

    // Get driver info
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      select: { iban: true, ibanHolderName: true, pendingPayout: true }
    });

    if (!driver) {
      return NextResponse.json({ error: "Sürücü bulunamadı" }, { status: 404 });
    }

    if (!driver.iban || !driver.ibanHolderName) {
      return NextResponse.json({ error: "Sürücünün IBAN bilgisi eksik" }, { status: 400 });
    }

    if (amount > driver.pendingPayout) {
      return NextResponse.json({ error: "Ödeme miktarı bekleyen tutardan fazla olamaz" }, { status: 400 });
    }

    // Create payout record and update driver pending amount
    const [payout] = await prisma.$transaction([
      prisma.driverPayout.create({
        data: {
          driverId,
          amount,
          iban: driver.iban,
          ibanHolder: driver.ibanHolderName,
          status: "COMPLETED",
          processedBy: adminId,
          processedAt: new Date(),
          notes
        }
      }),
      prisma.driver.update({
        where: { id: driverId },
        data: {
          pendingPayout: { decrement: amount },
          lastPayoutDate: new Date(),
          lastPayoutAmount: amount
        }
      })
    ]);

    return NextResponse.json({ success: true, payout });
  } catch (error) {
    console.error("Admin payout create error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
