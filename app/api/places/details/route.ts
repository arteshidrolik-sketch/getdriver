import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Sunucu tarafında saklanır, tarayıcıya gönderilmez
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";

export async function GET(req: NextRequest) {
  try {
    // Kimlik doğrulama: sadece oturum açmış kullanıcılar
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const placeId = searchParams.get("place_id");

    if (!placeId) {
      return NextResponse.json({ error: "Missing place_id" }, { status: 400 });
    }

    const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    url.searchParams.set("place_id", placeId);
    url.searchParams.set("key", GOOGLE_MAPS_API_KEY);
    url.searchParams.set("fields", "geometry,formatted_address,name");
    url.searchParams.set("language", "tr");

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status === "OK" && data.result) {
      return NextResponse.json({
        lat: data.result.geometry.location.lat,
        lng: data.result.geometry.location.lng,
        address: data.result.formatted_address || data.result.name,
      });
    }

    return NextResponse.json({ error: data.status }, { status: 400 });
  } catch (error) {
    console.error("Place details error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
