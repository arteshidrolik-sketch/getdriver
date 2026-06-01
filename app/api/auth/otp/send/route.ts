export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateOTP } from "@/lib/utils";
import { checkRateLimit, getClientIP, rateLimitExceededResponse, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";
import { sendOTPSMS } from "@/lib/sms";

export async function POST(request: Request) {
  try {
    // Rate limiting kontrolü - OTP spam koruması
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP, "otpSend", RATE_LIMIT_CONFIGS.otpSend);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        rateLimitExceededResponse(rateLimit.resetIn),
        { status: 429 }
      );
    }

    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: "Telefon numarası gerekli" },
        { status: 400 }
      );
    }

    // Generate OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Delete old OTPs for this phone
    await prisma.otpCode.deleteMany({
      where: { phone },
    });

    // Create new OTP
    await prisma.otpCode.create({
      data: {
        phone,
        code,
        expiresAt,
      },
    });

    // İletimerkezi ile SMS gönder
    const smsResult = await sendOTPSMS(phone, code);
    
    if (!smsResult.success) {
      console.error("SMS gönderilemedi:", smsResult.error);
      // SMS gönderilemese bile OTP veritabanına kaydedildi
      // Geliştirme aşamasında hata döndürme, sadece logla
      return NextResponse.json({
        success: true,
        message: "Doğrulama kodu gönderildi",
        // Geliştirme modunda hata bilgisi (production'da kaldırılabilir)
        smsWarning: smsResult.error,
      });
    }
    
    return NextResponse.json({
      success: true,
      message: "Doğrulama kodu gönderildi",
    });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json(
      { error: "OTP gönderilirken hata oluştu" },
      { status: 500 }
    );
  }
}