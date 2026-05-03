export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

// POST /api/auth/reset-password - Yeni şifre kaydet
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone: rawPhone, code, password } = body;

    // Telefon numarasını normalize et (signup ile aynı format: 0XXXXXXXXXX - 11 hane)
    const phoneDigits = rawPhone?.replace(/\D/g, "") || "";
    const phone = phoneDigits.length === 10 && !phoneDigits.startsWith("0")
      ? "0" + phoneDigits
      : phoneDigits;

    // Validasyon
    if (!phone || !code || !password) {
      return NextResponse.json(
        { error: "Eksik bilgi" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Şifre en az 8 karakter olmalı" },
        { status: 400 }
      );
    }

    // Kodu doğrula
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        phone,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Geçersiz veya süresi dolmuş kod" },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Transaction: Şifreyi güncelle ve kodu kullanıldı işaretle
    await prisma.$transaction([
      // Kullanıcı şifresini güncelle
      prisma.user.update({
        where: { phone },
        data: { password: hashedPassword },
      }),
      // Kodu kullanıldı işaretle
      prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { used: true },
      }),
    ]);

    console.log(`[ResetPassword] Şifre güncellendi - Telefon: ${phone}`);

    return NextResponse.json({
      success: true,
      message: "Şifreniz güncellendi",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Şifre güncellenemedi" },
      { status: 500 }
    );
  }
}
