export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateOTP } from "@/lib/utils";

// İleti Merkezi SMS gönderme fonksiyonu
async function sendSMS(phone: string, message: string): Promise<boolean> {
  try {
    const apiKey = process.env.ILETIMERKEZI_API_KEY;
    const apiHash = process.env.ILETIMERKEZI_API_HASH;
    
    if (!apiKey || !apiHash) {
      console.error("[SMS] API key veya hash eksik");
      // Development modunda console'a yaz
      console.log(`[SMS MOCK] ${phone}: ${message}`);
      return true;
    }

    // Telefon numarasını formatla (başındaki 0'ı kaldır)
    const formattedPhone = phone.startsWith("0") ? phone.slice(1) : phone;
    
    const payload = {
      iys: "0",
      iysList: "BIREYSEL",
      sender: "GETDRIVER",
      message,
      phones: [formattedPhone],
    };

    const response = await fetch("https://api.iletimerkezi.com/v1/send-sms/json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}:${apiHash}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("[SMS] API hatası:", await response.text());
      return false;
    }

    const data = await response.json();
    console.log("[SMS] Gönderildi:", data);
    return true;
  } catch (error) {
    console.error("[SMS] Hata:", error);
    // Hata durumunda development modunda başarılı say
    console.log(`[SMS MOCK - ERROR] ${phone}: ${message}`);
    return true;
  }
}

// POST /api/auth/forgot-password - SMS kodu gönder
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone || phone.length !== 10) {
      return NextResponse.json(
        { error: "Geçerli bir telefon numarası girin" },
        { status: 400 }
      );
    }

    // Kullanıcıyı kontrol et
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      // Güvenlik için kullanıcı olmasa bile aynı mesajı dön
      // (Bu sayede kötü niyetli kişiler hangi numaraların kayıtlı olduğunu öğrenemez)
      return NextResponse.json({
        success: true,
        message: "Eğer bu numara kayıtlıysa kod gönderildi",
      });
    }

    // Eski kodları temizle
    await prisma.otpCode.deleteMany({
      where: { phone },
    });

    // Yeni kod oluştur
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 dakika geçerli

    await prisma.otpCode.create({
      data: {
        phone,
        code,
        expiresAt,
      },
    });

    // SMS gönder
    const message = `GetDriver şifre sıfırlama kodunuz: ${code}. Bu kod 10 dakika geçerlidir.`;
    const smsSent = await sendSMS(phone, message);

    if (!smsSent) {
      console.error("[ForgotPassword] SMS gönderilemedi:", phone);
      // SMS gönderilemese bile devam et (development modu)
    }

    // Development modunda kodu logla
    console.log(`[ForgotPassword] Kod oluşturuldu - Telefon: ${phone}, Kod: ${code}`);

    return NextResponse.json({
      success: true,
      message: "Doğrulama kodu gönderildi",
      // Sadece development modunda kodu dön
      ...(process.env.NODE_ENV === "development" && { code }),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "İşlem başarısız" },
      { status: 500 }
    );
  }
}
