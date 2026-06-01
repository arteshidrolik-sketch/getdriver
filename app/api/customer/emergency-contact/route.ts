export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { emergencyContact } = body;

    await prisma.user.update({
      where: { id: userId },
      data: { emergencyContact },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update emergency contact error:", error);
    return NextResponse.json({ error: "Kaydedilemedi" }, { status: 500 });
  }
}
