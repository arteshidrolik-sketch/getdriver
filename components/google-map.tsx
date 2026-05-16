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
  driverLocation?: { lat: number; lng: number };
}

// API anahtarını sunucudan çek
async function fetchGoogleMapsApiKey(): Promise<string> {
  try {
    const res = await fetch("/api/maps/config");
    if (!res.ok) return "";
    const data = await res.json();
    return data.apiKey || "";
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
  driverLocation,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<any[]>([]);
  const directionsRendererRef = useRef<any>(null);
  const pickMarkerRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
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

    // API key'i sunucudan çek
    fetchGoogleMapsApiKey().then((apiKey) => {
      if (!apiKey) {
        setError("Google Maps API key bulunamadı");
        return;
      }

      // Double-check: loading sırasında başka biri yüklemiş olabilir
      if (window.google?.maps) {
        setIsReady(true);
        return;
      }
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        const checkLoaded = setInterval(() => {
          if (window.google?.maps) {
            clearInterval(checkLoaded);
            setIsReady(true);
          }
        }, 100);
        return;
      }

      console.log("Loading Google Maps...");
      
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

    // Clear old markers (except driver marker)
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach((marker) => {
      // Skip driver marker here, handle separately
      if (marker.title === "Sürücü") return;
      
      const m = new window.google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map,
        title: marker.title || "",
      });
      markersRef.current.push(m);
    });
  }, [isReady, markers]);

  // Update driver marker separately for smooth animation
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google?.maps) return;

    if (driverLocation) {
      if (driverMarkerRef.current) {
        // Update existing marker position
        driverMarkerRef.current.setPosition({
          lat: driverLocation.lat,
          lng: driverLocation.lng,
        });
      } else {
        // Create new driver marker with custom icon
        driverMarkerRef.current = new window.google.maps.Marker({
          position: { lat: driverLocation.lat, lng: driverLocation.lng },
          map,
          title: "Sürücü",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#16a34a",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });
      }
    }
  }, [isReady, driverLocation]);

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