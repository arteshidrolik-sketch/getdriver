import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    // Check if admin
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
    });
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin yetkisi gerekli" }, { status: 403 });
    }

    // Fetch all data
    const drivers = await prisma.driver.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
    });

    const rides = await prisma.ride.findMany({
      include: {
        driver: { include: { user: true } },
        request: { include: { customer: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Create workbook
    const wb = XLSX.utils.book_new();

    // 1. Sürücüler sheet
    const driversData = drivers.map((d) => ({
      "Ad Soyad": d.user.name,
      "Telefon": d.user.phone,
      "E-posta": d.user.email || "-",
      "Onay Durumu": d.approvalStatus,
      "IBAN": d.iban || "-",
      "Hesap Sahibi": d.ibanHolderName || "-",
      "Toplam Kazanç": d.totalEarnings,
      "Toplam Yolculuk": d.totalRides,
      "Puan": d.ratingAvg,
      "Değerlendirme Sayısı": d.ratingCount,
      "Kayıt Tarihi": d.createdAt,
    }));
    const driversSheet = XLSX.utils.json_to_sheet(driversData);
    XLSX.utils.book_append_sheet(wb, driversSheet, "Sürücüler");

    // 2. Müşteriler sheet
    const customersData = customers.map((c) => ({
      "Ad Soyad": c.name,
      "Telefon": c.phone,
      "E-posta": c.email || "-",
      "Kayıt Tarihi": c.createdAt,
    }));
    const customersSheet = XLSX.utils.json_to_sheet(customersData);
    XLSX.utils.book_append_sheet(wb, customersSheet, "Müşteriler");

    // 3. Yolculuklar sheet
    const ridesData = rides.map((r) => ({
      "Yolculuk ID": r.id,
      "Sürücü": r.driver.user.name,
      "Sürücü Tel": r.driver.user.phone,
      "Müşteri": r.request.customer.name,
      "Müşteri Tel": r.request.customer.phone,
      "Durum": r.status,
      "Tutar": r.price,
      "Platform Ücreti": r.platformFee,
      "Sürücü Kazancı": r.driverAmount,
      "Mesafe (km)": r.distanceKm || "-",
      "Süre (dk)": r.durationMinutes || "-",
      "Oluşturma": r.createdAt,
      "Tamamlama": r.completedAt || "-",
      "İptal Eden": r.cancelledBy || "-",
      "İptal Sebebi": r.cancellationReason || "-",
    }));
    const ridesSheet = XLSX.utils.json_to_sheet(ridesData);
    XLSX.utils.book_append_sheet(wb, ridesSheet, "Yolculuklar");

    // 4. Ödemeler sheet
    const payouts = await prisma.driverPayout.findMany({
      include: { driver: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    });

    const payoutsData = payouts.map((p) => ({
      "Sürücü": p.driver.user.name,
      "Telefon": p.driver.user.phone,
      "IBAN": p.driver.iban || "-",
      "Hesap Sahibi": p.driver.ibanHolderName || "-",
      "Tutar": p.amount,
      "Durum": p.status,
      "Talep Tarihi": p.createdAt,
      "Ödeme Tarihi": p.processedAt || "-",
    }));
    const payoutsSheet = XLSX.utils.json_to_sheet(payoutsData);
    XLSX.utils.book_append_sheet(wb, payoutsSheet, "Ödemeler");

    // Generate buffer
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // Return as download
    const now = new Date().toISOString().split("T")[0];
    const filename = `GetDriver_Export_${now}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export başarısız" }, { status: 500 });
  }
}
