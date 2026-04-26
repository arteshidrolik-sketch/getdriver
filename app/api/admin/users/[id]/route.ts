import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// PATCH - Update user status (ban/unban)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    const { userId, action } = await req.json();

    if (!userId || !action) {
      return NextResponse.json({ error: "userId ve action gerekli" }, { status: 400 });
    }

    let newStatus: "ACTIVE" | "SUSPENDED" | "BANNED";

    switch (action) {
      case "ban":
        newStatus = "SUSPENDED";
        break;
      case "activate":
        newStatus = "ACTIVE";
        break;
      case "delete":
        // Soft delete - just mark as banned
        await prisma.user.update({
          where: { id: userId },
          data: { status: "BANNED" },
        });
        return NextResponse.json({ success: true, message: "Kullanıcı silindi" });
      default:
        return NextResponse.json({ error: "Geçersiz action" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error("User action error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}