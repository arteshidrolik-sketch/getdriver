export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";


// Sunucu tarafında saklanır, tarayıcıya gönderilmez
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";

export async function GET(req: NextRequest) {
  try {
    // Kimlik doğrulama kaldırıldı - herkese açık

    const { searchParams } = new URL(req.url);
    const input = searchParams.get("input");

    if (!input || input.length < 2) {
      return NextResponse.json({ predictions: [] });
    }

    const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
    url.searchParams.set("input", input);
    url.searchParams.set("key", GOOGLE_MAPS_API_KEY);
    url.searchParams.set("components", "country:tr");
    url.searchParams.set("language", "tr");

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status === "OK") {
      const predictions = data.predictions.map((p: any) => ({
        place_id: p.place_id,
        description: p.description,
      }));
      return NextResponse.json({ predictions });
    }

    return NextResponse.json({ predictions: [], error: data.status });
  } catch (error) {
    console.error("Places autocomplete error:", error);
    return NextResponse.json({ predictions: [], error: "Failed to fetch" });
  }
}
