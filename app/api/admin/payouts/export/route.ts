import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// Export pending payouts as CSV
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    // Get all drivers with pending payouts and IBAN
    const drivers = await prisma.driver.findMany({
      where: {
        approvalStatus: "APPROVED",
        pendingPayout: { gt: 0 },
        iban: { not: null }
      },
      include: {
        user: {
          select: {
            name: true,
            phone: true
          }
        }
      },
      orderBy: { pendingPayout: "desc" }
    });

    // Create CSV content
    const headers = ["Sürücü Adı", "Telefon", "IBAN", "Hesap Sahibi", "Ödenecek Tutar (TL)", "Toplam Kazanç (TL)"];
    const rows = drivers.map((d: any) => [
      d.user.name || "-",
      d.user.phone || "-",
      d.iban || "-",
      d.ibanHolderName || "-",
      d.pendingPayout.toFixed(2),
      d.totalEarnings.toFixed(2)
    ]);

    // Add total row
    const totalPending = drivers.reduce((sum: number, d: any) => sum + d.pendingPayout, 0);
    rows.push([]);
    rows.push(["TOPLAM", "", "", "", totalPending.toFixed(2), ""]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row: any[]) => row.join(","))
    ].join("\n");

    // Add BOM for Turkish character support in Excel
    const bom = "\uFEFF";
    const csvWithBom = bom + csvContent;

    const date = new Date().toISOString().split("T")[0];
    
    return new NextResponse(csvWithBom, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="surucu-odemeleri-${date}.csv"`
      }
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
