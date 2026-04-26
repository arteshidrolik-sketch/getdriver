export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, firstName, lastName, password, role = "CUSTOMER" } = body;

    if (!phone || !firstName || !lastName || !password) {
      return NextResponse.json(
        { error: "Telefon, ad, soyad ve şifre zorunludur" },
        { status: 400 }
      );
    }
    
    // Telefon validasyonu: 10 hane (0sız)
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      return NextResponse.json(
        { error: "Telefon numarası 10 rakam olmalı" },
        { status: 400 }
      );
    }
    
    // Telefonu 0 olmadan kaydet (standart format)
    const normalizedPhone = phoneDigits;
    
    // Full name
    const fullName = `${firstName} ${lastName}`;
    
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
      include: { driver: true },
    });

    if (existingUser) {
      // Kullanıcı zaten var, sürücü başvurusu mu yapıyor?
      if (role === "DRIVER") {
        // Kullanıcı zaten sürücü mü?
        if (existingUser.driver) {
          return NextResponse.json(
            { error: "Bu telefon numarası ile zaten sürücü başvurusu yapılmış" },
            { status: 400 }
          );
        }
        
        // Kullanıcı var ama sürücü değil, sürücü kaydı ekle
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Şifreyi güncelle (eğer farklıysa)
        if (existingUser.password !== hashedPassword) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { password: hashedPassword },
          });
        }
        
        // Rolü DRIVER yap
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { role: "DRIVER" },
        });
        
        // Sürücü kaydı oluştur
        await prisma.driver.create({
          data: {
            userId: existingUser.id,
            approvalStatus: "PENDING",
          },
        });
        
        return NextResponse.json({
          success: true,
          message: "Sürücü başvurusu başarılı",
          userId: existingUser.id,
          isExistingUser: true,
        });
      }
      
      // Normal kayıt (CUSTOMER) - zaten varsa hata ver
      return NextResponse.json(
        { error: "Bu telefon numarası zaten kayıtlı" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        phone: normalizedPhone,
        name: fullName,
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
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Kayıt sırasında bir hata oluştu", details: error?.message, code: error?.code },
      { status: 500 }
    );
  }
}