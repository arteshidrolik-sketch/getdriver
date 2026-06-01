export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const driver = await prisma.driver.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!driver) {
      return NextResponse.json(
        { error: "Sürücü profili bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({ driver });
  } catch (error) {
    console.error("Get driver profile error:", error);
    return NextResponse.json(
      { error: "Profil getirilemedi" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { licensePhoto, profilePhoto, criminalRecordDecl, criminalRecordPhoto, licenseExpiry, licenseYears } = body;

    // Update driver record
    const driver = await prisma.driver.update({
      where: { userId },
      data: {
        ...(licensePhoto && { licensePhoto }),
        ...(criminalRecordPhoto && { criminalRecordPhoto }),
        ...(criminalRecordDecl !== undefined && { criminalRecordDecl }),
        ...(licenseExpiry && { licenseExpiry: new Date(licenseExpiry) }),
        ...(licenseYears && { licenseYears }),
      },
    });

    // Update user profile photo if provided
    if (profilePhoto) {
      await prisma.user.update({
        where: { id: userId },
        data: { profilePhoto },
      });
    }

    return NextResponse.json({
      success: true,
      driver,
    });
  } catch (error) {
    console.error("Update driver profile error:", error);
    return NextResponse.json(
      { error: "Profil güncellenemedi" },
      { status: 500 }
    );
  }
}