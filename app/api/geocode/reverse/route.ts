import { NextRequest, NextResponse } from "next/server";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "";

// Reverse geocode: lat,lng -> address
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json({ error: "lat ve lng gerekli" }, { status: 400 });
    }

    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("latlng", `${lat},${lng}`);
    url.searchParams.set("key", GOOGLE_MAPS_API_KEY);
    url.searchParams.set("language", "tr");

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status === "OK" && data.results?.[0]) {
      return NextResponse.json({
        address: data.results[0].formatted_address,
        location: {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        },
      });
    }

    return NextResponse.json({ 
      address: "Mevcut Konum",
      location: { lat: parseFloat(lat), lng: parseFloat(lng) }
    });
  } catch (error) {
    console.error("Reverse geocode error:", error);
    return NextResponse.json({ error: "Geocode failed" }, { status: 500 });
  }
}