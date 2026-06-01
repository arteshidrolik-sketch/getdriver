import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Firebase Admin SDK - server-side
const { initializeApp, getApps } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");

// Initialize Firebase Admin
function initFirebaseAdmin() {
  if (getApps().length === 0) {
    initializeApp({
      credential: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
    });
  }
  return getMessaging();
}

// Send notification to specific user
export async function POST(req: NextRequest) {
  try {
    const { userId, title, body, data } = await req.json();

    if (!userId || !title || !body) {
      return NextResponse.json({ error: "userId, title ve body gerekli" }, { status: 400 });
    }

    // Get user's FCM token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (!user?.fcmToken) {
      return NextResponse.json({ error: "Kullanıcı FCM token yok" }, { status: 404 });
    }

    // Send via FCM
    const messaging = initFirebaseAdmin();
    
    await messaging.send({
      token: user.fcmToken,
      notification: { title, body },
      data: data || {},
      webpush: {
        notification: {
          icon: "/icon-192.png",
          badge: "/icon-192.png",
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("FCM send error:", error);
    return NextResponse.json({ error: "Gönderme başarısız" }, { status: 500 });
  }
}

// Broadcast to all users (admin only)
export async function GET() {
  try {
    const messaging = initFirebaseAdmin();
    
    // Get all users with FCM tokens
    const users = await prisma.user.findMany({
      where: { fcmToken: { not: null } },
      select: { fcmToken: true },
    });

    const tokens = users.map(u => u.fcmToken).filter(Boolean);

    if (tokens.length === 0) {
      return NextResponse.json({ error: "Token bulanamadı" }, { status: 404 });
    }

    // Broadcast
    await messaging.sendEach(tokens.map(token => ({
      token,
      notification: { title: "Test", body: "Bildirim testi" },
    })));

    return NextResponse.json({ success: true, count: tokens.length });
  } catch (error) {
    console.error("FCM broadcast error:", error);
    return NextResponse.json({ error: "Gönderme başarısız" }, { status: 500 });
  }
}