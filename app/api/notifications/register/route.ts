import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const { token, type } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token gerekli" }, { status: 400 });
    }

    // Update or create notification token
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        fcmToken: token,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification register error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}