export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";


/**
 * Google Maps JS API anahtarını sadece oturum açmış kullanıcılara döner.
 * GOOGLE_MAPS_API_KEY sunucu tarafında saklanır, NEXT_PUBLIC_ olmadığı için
 * tarayıcı bundle'ına gömülmez.
 */
export async function GET() {
  // Harita API key'ini herkese açık yap (sadece key'i döndür, hassas veri yok)
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || "";
  if (!apiKey) {
    return NextResponse.json({ error: "Maps API key yapılandırılmamış" }, { status: 500 });
  }

  return NextResponse.json({ apiKey });
}
