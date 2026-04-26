import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Admin yapma - sadece 1 kez kullanılabilir veya güvenli tutulmalı
// Bu endpointi sildikten sonra kullan

export async function POST(req: NextRequest) {
  try {
    const { phone, secret } = await req.json();

    // Güvenlik için basit secret kontrolü
    if (secret !== "getdriver-admin-2026") {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    if (!phone) {
      return NextResponse.json({ error: "Telefon gerekli" }, { status: 400 });
    }

    // Normalize phone - add 0 if not present
    const phoneDigits = phone.replace(/\D/g, "");
    const normalizedPhone = phoneDigits.startsWith("0") ? phoneDigits : `0${phoneDigits}`;
    
    const user = await prisma.user.findFirst({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    });

    return NextResponse.json({ 
      success: true, 
      message: `${phone} numaralı kullanıcı ADMIN yapıldı` 
    });
  } catch (error) {
    console.error("Admin update error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}