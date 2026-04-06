import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

/**
 * Google Maps JS API anahtarını sadece oturum açmış kullanıcılara döner.
 * GOOGLE_MAPS_API_KEY sunucu tarafında saklanır, NEXT_PUBLIC_ olmadığı için
 * tarayıcı bundle'ına gömülmez.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || "";
  if (!apiKey) {
    return NextResponse.json({ error: "Maps API key yapılandırılmamış" }, { status: 500 });
  }

  return NextResponse.json({ apiKey });
}
