"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, MapPin } from "lucide-react";

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
    googleMapsLoaded: boolean;
  }
}

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    lat: number;
    lng: number;
    title?: string;
    icon?: string;
  }>;
  onMapClick?: (lat: number, lng: number) => void;
  showRoute?: boolean;
  origin?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  className?: string;
  pickMode?: boolean;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
}

// API anahtarı /api/maps/config üzerinden sunucu tarafından alınır (NEXT_PUBLIC_ değil)
let cachedApiKey: string | null = null;

async function getGoogleMapsApiKey(): Promise<string> {
  if (cachedApiKey) return cachedApiKey;
  try {
    const res = await fetch("/api/maps/config");
    if (!res.ok) throw new Error("Maps config alınamadı");
    const data = await res.json();
    cachedApiKey = data.apiKey || "";
    return cachedApiKey as string;
  } catch {
    return "";
  }
}

// Default center - Istanbul
const DEFAULT_CENTER = { lat: 41.0082, lng: 28.9784 };

export function GoogleMap({
  center,
  zoom = 13,
  markers = [],
  onMapClick,
  showRoute = false,
  origin,
  destination,
  className = "w-full h-[400px]",
  pickMode = false,
  onLocationSelect,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<any[]>([]);
  const directionsRendererRef = useRef<any>(null);
  const pickMarkerRef = useRef<any>(null);
  const onLocationSelectRef = useRef(onLocationSelect);
  const onMapClickRef = useRef(onMapClick);

  // Keep refs updated
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
    onMapClickRef.current = onMapClick;
  }, [onLocationSelect, onMapClick]);

  // Load Google Maps Script - only once
  useEffect(() => {
    // Already loaded
    if (window.google?.maps) {
      setIsReady(true);
      return;
    }

    // Already loading
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      const checkLoaded = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(checkLoaded);
          setIsReady(true);
        }
      }, 100);
      return () => clearInterval(checkLoaded);
    }

    // Anahtarı sunucu taraflı endpoint'ten al, sonra script'i yükle
    getGoogleMapsApiKey().then((apiKey) => {
      if (!apiKey) {
        setError("Google Maps API key bulunamadı");
        return;
      }

      console.log("Loading Google Maps with key...");
      
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;

      window.initGoogleMaps = () => {
        console.log("Google Maps loaded successfully");
        window.googleMapsLoaded = true;
        setIsReady(true);
      };

      script.onerror = (e) => {
        console.error("Google Maps script error:", e);
        setError("Google Maps yüklenemedi - Script hatası");
      };

      document.head.appendChild(script);
    }).catch((err) => {
      console.error("Failed to get API key:", err);
      setError("API key alınamadı");
    });
  }, []);

  // Initialize map - only once when ready
  useEffect(() => {
    if (!isReady || !mapRef.current || mapInstanceRef.current || !window.google?.maps) return;

    const mapCenter = center || DEFAULT_CENTER;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: mapCenter,
      zoom,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    mapInstanceRef.current = mapInstance;

    // Add click listener
    mapInstance.addListener("click", async (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      if (pickMode && onLocationSelectRef.current) {
        // Remove old pick marker
        if (pickMarkerRef.current) {
          pickMarkerRef.current.setMap(null);
        }

        // Add new marker
        pickMarkerRef.current = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstance,
          animation: window.google.maps.Animation.DROP,
        });

        // Reverse geocode
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === "OK" && results?.[0]) {
            onLocationSelectRef.current?.(lat, lng, results[0].formatted_address);
          } else {
            onLocationSelectRef.current?.(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          }
        });
      } else if (onMapClickRef.current) {
        onMapClickRef.current(lat, lng);
      }
    });
  }, [isReady, pickMode, zoom, center]);

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google?.maps) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach((marker) => {
      const m = new window.google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map,
        title: marker.title || "",
      });
      markersRef.current.push(m);
    });
  }, [isReady, markers]);

  // Show route
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !showRoute || !origin || !destination || !window.google?.maps) return;

    const directionsService = new window.google.maps.DirectionsService();

    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#16a34a",
          strokeWeight: 5,
        },
      });
    }

    directionsRendererRef.current.setMap(map);

    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result: any, status: any) => {
        if (status === "OK") {
          directionsRendererRef.current.setDirections(result);
        }
      }
    );
  }, [isReady, showRoute, origin, destination]);

  if (error) {
    return (
      <div className={`${className} bg-muted rounded-lg flex items-center justify-center`}>
        <div className="text-center text-muted-foreground">
          <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!isReady && (
        <div className="absolute inset-0 bg-muted rounded-lg flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={mapRef} className={`${className} rounded-lg`} />
      {pickMode && isReady && (
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-sm shadow">
          <MapPin className="inline h-4 w-4 mr-1 text-primary" />
          Haritaya tıklayarak konum seçin
        </div>
      )}
    </div>
  );
}