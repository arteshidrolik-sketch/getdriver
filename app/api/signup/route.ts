export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { checkRateLimit, getClientIP, rateLimitExceededResponse, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // Rate limiting kontrolü
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP, "signup", RATE_LIMIT_CONFIGS.signup);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        rateLimitExceededResponse(rateLimit.resetIn),
        { status: 429 }
      );
    }

    const body = await request.json();
    const { phone, name, password, role = "CUSTOMER" } = body;

    if (!phone || !name || !password) {
      return NextResponse.json(
        { error: "Telefon, isim ve şifre zorunludur" },
        { status: 400 }
      );
    }
    
    // Güçlü şifre kontrolü (en az 8 karakter, 1 büyük harf, 1 küçük harf, 1 rakam)
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Şifre en az 8 karakter olmalı" },
        { status: 400 }
      );
    }
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "Şifre en az bir büyük harf içermeli" },
        { status: 400 }
      );
    }
    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        { error: "Şifre en az bir küçük harf içermeli" },
        { status: 400 }
      );
    }
    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Şifre en az bir rakam içermeli" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu telefon numarası zaten kayıtlı" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        phone,
        name,
        password: hashedPassword,
        role: role === "DRIVER" ? "DRIVER" : "CUSTOMER",
        status: "ACTIVE",
      },
    });

    // If driver, create driver record
    if (role === "DRIVER") {
      await prisma.driver.create({
        data: {
          userId: user.id,
          approvalStatus: "PENDING",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Kayıt başarılı",
      userId: user.id,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Kayıt sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}