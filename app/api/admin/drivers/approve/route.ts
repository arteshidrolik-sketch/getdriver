export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    const { driverId, action, rejectionReason } = await request.json();

    if (!driverId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Geçersiz istek" },
        { status: 400 }
      );
    }

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      return NextResponse.json(
        { error: "Sürücü bulunamadı" },
        { status: 404 }
      );
    }

    const adminId = (session.user as any).id;

    await prisma.driver.update({
      where: { id: driverId },
      data: {
        approvalStatus: action === "approve" ? "APPROVED" : "REJECTED",
        approvedBy: action === "approve" ? adminId : null,
        approvedAt: action === "approve" ? new Date() : null,
        rejectionReason: action === "reject" ? rejectionReason : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Driver approval error:", error);
    return NextResponse.json(
      { error: "İşlem başarısız" },
      { status: 500 }
    );
  }
}