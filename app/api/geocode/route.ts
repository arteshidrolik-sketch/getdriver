export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Adres parametresi gerekli" },
        { status: 400 }
      );
    }

    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json(
        { error: "Google Maps API anahtarı yapılandırılmamış" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}&language=tr`
    );

    const data = await response.json();

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      return NextResponse.json(
        { error: "Adres bulunamadı", status: data.status },
        { status: 404 }
      );
    }

    const result = data.results[0];
    const location = result.geometry.location;

    return NextResponse.json({
      lat: location.lat,
      lng: location.lng,
      address: result.formatted_address,
      placeId: result.place_id,
    });
  } catch (error: any) {
    console.error("Geocode error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu", message: error?.message },
      { status: 500 }
    );
  }
}
