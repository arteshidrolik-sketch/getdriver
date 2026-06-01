export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  checkRateLimit,
  getClientIP,
  rateLimitExceededResponse,
  RATE_LIMIT_CONFIGS,
} from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // Rate limiting: max 5 deneme/dakika (brute force koruması)
    const ip = getClientIP(request);
    const rateLimitResult = checkRateLimit(ip, "otpVerify", RATE_LIMIT_CONFIGS.otpVerify);
    if (!rateLimitResult.success) {
      return NextResponse.json(rateLimitExceededResponse(rateLimitResult.resetIn), {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateLimitResult.resetIn / 1000)),
        },
      });
    }

    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Telefon ve kod gerekli" },
        { status: 400 }
      );
    }

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

    // Mark as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    return NextResponse.json({
      success: true,
      verified: true,
      userExists: !!user,
      userId: user?.id || null,
    });
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json(
      { error: "Doğrulama sırasında hata oluştu" },
      { status: 500 }
    );
  }
}
