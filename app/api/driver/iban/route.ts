import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// Get driver IBAN info
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    
    const driver = await prisma.driver.findUnique({
      where: { userId },
      select: {
        iban: true,
        ibanHolderName: true,
        pendingPayout: true,
        lastPayoutDate: true,
        lastPayoutAmount: true,
        totalEarnings: true
      }
    });

    if (!driver) {
      return NextResponse.json({ error: "Sürücü bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(driver);
  } catch (error) {
    console.error("IBAN get error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

// Update driver IBAN info
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { iban, ibanHolderName } = await request.json();

    if (!iban || !ibanHolderName) {
      return NextResponse.json({ error: "IBAN ve hesap sahibi adı gerekli" }, { status: 400 });
    }

    // Basic IBAN validation for Turkey (TR followed by 24 digits)
    const cleanIban = iban.replace(/\s/g, "").toUpperCase();
    if (!/^TR\d{24}$/.test(cleanIban)) {
      return NextResponse.json({ error: "Geçersiz IBAN formatı. TR ile başlamalı ve 26 karakter olmalı." }, { status: 400 });
    }

    const driver = await prisma.driver.update({
      where: { userId },
      data: {
        iban: cleanIban,
        ibanHolderName: ibanHolderName.trim().toUpperCase()
      }
    });

    return NextResponse.json({ success: true, message: "IBAN bilgileri güncellendi" });
  } catch (error) {
    console.error("IBAN update error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
