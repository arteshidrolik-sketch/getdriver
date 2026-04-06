export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { password, confirmText } = await request.json();

    // Kullanıcının "HESABIMI SİL" yazmasını iste
    if (confirmText !== "HESABIMI SİL") {
      return NextResponse.json(
        { error: 'Onaylamak için "HESABIMI SİL" yazın' },
        { status: 400 }
      );
    }

    // Şifre doğrulama
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    // OAuth kullanıcısı değilse şifre kontrolü yap
    if (user.password) {
      if (!password) {
        return NextResponse.json(
          { error: "Şifrenizi girin" },
          { status: 400 }
        );
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return NextResponse.json(
          { error: "Şifre yanlış" },
          { status: 400 }
        );
      }
    }

    // Transaction ile tüm kullanıcı verilerini sil
    await prisma.$transaction(async (tx) => {
      // İlişkili verileri sil (sıra önemli - foreign key constraints)
      
      // Mesajlar
      await tx.message.deleteMany({ where: { senderId: userId } });
      
      // Push subscriptions
      await tx.pushSubscription.deleteMany({ where: { userId } });
      
      // Ödeme yöntemleri
      await tx.paymentMethod.deleteMany({ where: { userId } });
      
      // Adresler
      await tx.address.deleteMany({ where: { userId } });
      
      // Araçlar
      await tx.vehicle.deleteMany({ where: { userId } });
      
      // OTP kodları (phone field kullanıldığı için direkt silmek mümkün değil, kullanıcı silinince orphan kalır)
      
      // Sürücü profilini (varsa)
      if (user.role === "DRIVER") {
        await tx.driver.deleteMany({ where: { userId } });
      }
      
      // Session'ları sil
      await tx.session.deleteMany({ where: { userId } });
      
      // Account'ları sil (OAuth için)
      await tx.account.deleteMany({ where: { userId } });
      
      // Son olarak kullanıcıyı sil
      await tx.user.delete({ where: { id: userId } });
    });

    return NextResponse.json({
      success: true,
      message: "Hesabınız ve tüm verileriniz başarıyla silindi",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Hesap silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
