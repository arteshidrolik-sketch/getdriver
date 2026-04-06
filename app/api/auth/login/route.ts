export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import {
  checkRateLimit,
  getClientIP,
  rateLimitExceededResponse,
  RATE_LIMIT_CONFIGS,
} from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // Rate limiting: 5 dakikada 10 deneme
    const ip = getClientIP(request);
    const rateLimitResult = checkRateLimit(ip, "login", RATE_LIMIT_CONFIGS.login);
    if (!rateLimitResult.success) {
      return NextResponse.json(rateLimitExceededResponse(rateLimitResult.resetIn), {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateLimitResult.resetIn / 1000)),
        },
      });
    }

    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Telefon ve şifre gerekli" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { phone },
      include: { driver: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "Bu hesap Google ile kayıtlı. Lütfen Google ile giriş yapın." },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Geçersiz şifre" },
        { status: 401 }
      );
    }

    if (user.status === "BANNED") {
      return NextResponse.json(
        { error: "Hesabınız engellenmiştir" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        driverStatus: user.driver?.approvalStatus || null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Giriş sırasında hata oluştu" },
      { status: 500 }
    );
  }
}
