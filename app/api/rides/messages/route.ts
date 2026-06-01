import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// GET messages for a ride
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const rideId = searchParams.get("rideId");

    if (!rideId) {
      return NextResponse.json({ error: "Yolculuk ID gerekli" }, { status: 400 });
    }

    // Verify user is part of this ride
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        request: true,
        driver: true
      }
    });

    if (!ride) {
      return NextResponse.json({ error: "Yolculuk bulunamadı" }, { status: 404 });
    }

    const isCustomer = ride.request.customerId === userId;
    const isDriver = ride.driver?.userId === userId;

    if (!isCustomer && !isDriver) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: { rideId },
      orderBy: { createdAt: "asc" }
    });

    // Mark messages as read for the current user
    const otherSenderType = isCustomer ? "DRIVER" : "CUSTOMER";
    await prisma.message.updateMany({
      where: {
        rideId,
        senderType: otherSenderType,
        isRead: false
      },
      data: { isRead: true }
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json({ error: "Mesajlar getirilemedi" }, { status: 500 });
  }
}

// POST a new message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { rideId, content } = body;

    if (!rideId || !content?.trim()) {
      return NextResponse.json({ error: "Yolculuk ID ve mesaj içeriği gerekli" }, { status: 400 });
    }

    // Verify user is part of this ride
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        request: true,
        driver: true
      }
    });

    if (!ride) {
      return NextResponse.json({ error: "Yolculuk bulunamadı" }, { status: 404 });
    }

    const isCustomer = ride.request.customerId === userId;
    const isDriver = ride.driver?.userId === userId;

    if (!isCustomer && !isDriver) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    // Check if ride is still active (not completed or cancelled)
    const inactiveStatuses = ["COMPLETED", "CANCELLED"];
    if (inactiveStatuses.includes(ride.status)) {
      return NextResponse.json({ 
        error: "Yolculuk tamamlandığı veya iptal edildiği için mesaj gönderilemez" 
      }, { status: 400 });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        rideId,
        senderId: userId,
        senderType: isCustomer ? "CUSTOMER" : "DRIVER",
        content: content.trim()
      }
    });

    return NextResponse.json({ message, success: true });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Mesaj gönderilemedi" }, { status: 500 });
  }
}
