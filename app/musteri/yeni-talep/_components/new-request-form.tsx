"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Car, Navigation, Loader2, Info, LocateFixed, Search, X, Home, Briefcase, Star, ChevronDown, CreditCard, AlertTriangle, Plus, Calendar, Clock } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { GoogleMap } from "@/components/google-map";
import { useToast } from "@/hooks/use-toast";

interface NewRequestFormProps {
  vehicles: any[];
  savedAddresses: any[];
  paymentMethods: any[];
}

interface PlacePrediction {
  place_id: string;
  description: string;
}

export function NewRequestForm({ vehicles, savedAddresses, paymentMethods }: NewRequestFormProps) {
  const [selectedVehicle, setSelectedVehicle] = useState(vehicles?.[0]?.id || "");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethods?.[0]?.id || "");
  const [pickup, setPickup] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [dropoff, setDropoff] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [activeMap, setActiveMap] = useState<"pickup" | "dropoff">("pickup");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  // Rezervasyon states
  const [isReservation, setIsReservation] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  
  // Search states
  const [pickupSearch, setPickupSearch] = useState("");
  const [dropoffSearch, setDropoffSearch] = useState("");
  const [pickupPredictions, setPickupPredictions] = useState<PlacePrediction[]>([]);
  const [dropoffPredictions, setDropoffPredictions] = useState<PlacePrediction[]>([]);
  
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const dropoffInputRef = useRef<HTMLInputElement>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const skipSearchRef = useRef(false); // Yer seçildiğinde aramayı atla
  
  const router = useRouter();
  const { toast } = useToast();

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: "Hata",
        description: "Tarayıcınız konum özelliğini desteklemiyor",
        variant: "destructive",
      });
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocode to get address
        try {
          const w = window as any;
          const geocoder = new w.google.maps.Geocoder();
          const response = await geocoder.geocode({ location: { lat: latitude, lng: longitude } });
          const address = response.results[0]?.formatted_address || "Mevcut Konum";
          
          setPickup({ lat: latitude, lng: longitude, address });
          setPickupSearch(address);
          setActiveMap("dropoff");
          toast({
            title: "Konum Alındı",
            description: "Alış noktası mevcut konumunuz olarak ayarlandı",
            variant: "success",
          });
        } catch (error) {
          setPickup({ lat: latitude, lng: longitude, address: "Mevcut Konum" });
          setPickupSearch("Mevcut Konum");
          setActiveMap("dropoff");
        }
        setGettingLocation(false);
      },
      (error) => {
        setGettingLocation(false);
        let errorMessage = "Konum alınamadı";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Konum izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.";
        }
        toast({
          title: "Hata",
          description: errorMessage,
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [toast]);

  // Search for places using backend API
  const searchPlaces = useCallback(async (query: string, type: "pickup" | "dropoff") => {
    if (!query || query.length < 2) {
      if (type === "pickup") setPickupPredictions([]);
      else setDropoffPredictions([]);
      return;
    }

    try {
      const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.predictions) {
        if (type === "pickup") {
          setPickupPredictions(data.predictions);
        } else {
          setDropoffPredictions(data.predictions);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  }, []);

  // Handle place selection using backend API
  const selectPlace = useCallback(async (placeId: string, type: "pickup" | "dropoff") => {
    setSearchLoading(true);
    // Aramayı atla - seçim yapıldığında yeni arama tetiklenmesini engelle
    skipSearchRef.current = true;
    
    try {
      const response = await fetch(`/api/places/details?place_id=${encodeURIComponent(placeId)}`);
      const data = await response.json();
      
      if (data.lat && data.lng) {
        const location = {
          lat: data.lat,
          lng: data.lng,
          address: data.address,
        };

        if (type === "pickup") {
          setPickupPredictions([]); // Önce temizle
          setPickup(location);
          setPickupSearch(location.address);
          setActiveMap("dropoff");
          setTimeout(() => dropoffInputRef.current?.focus(), 100);
        } else {
          setDropoffPredictions([]); // Önce temizle
          setDropoff(location);
          setDropoffSearch(location.address);
        }
      }
    } catch (error) {
      console.error("Place details error:", error);
      toast({
        title: "Hata",
        description: "Konum bilgisi alınamadı",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
      // Bir süre sonra aramayı tekrar etkinleştir
      setTimeout(() => {
        skipSearchRef.current = false;
      }, 500);
    }
  }, [toast]);

  // Debounced search for pickup
  useEffect(() => {
    if (skipSearchRef.current) return; // Seçim yapıldıysa aramayı atla
    
    if (!pickupSearch || pickupSearch.length < 2) {
      setPickupPredictions([]);
      return;
    }
    
    const timer = setTimeout(() => {
      if (!skipSearchRef.current) {
        searchPlaces(pickupSearch, "pickup");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [pickupSearch, searchPlaces]);

  // Debounced search for dropoff
  useEffect(() => {
    if (skipSearchRef.current) return; // Seçim yapıldıysa aramayı atla
    
    if (!dropoffSearch || dropoffSearch.length < 2) {
      setDropoffPredictions([]);
      return;
    }
    
    const timer = setTimeout(() => {
      if (!skipSearchRef.current) {
        searchPlaces(dropoffSearch, "dropoff");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [dropoffSearch, searchPlaces]);

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    skipSearchRef.current = true; // Aramayı atla
    
    if (activeMap === "pickup") {
      setPickupPredictions([]);
      setPickup({ lat, lng, address });
      setPickupSearch(address);
      setActiveMap("dropoff");
    } else {
      setDropoffPredictions([]);
      setDropoff({ lat, lng, address });
      setDropoffSearch(address);
    }
    
    setTimeout(() => {
      skipSearchRef.current = false;
    }, 500);
  };

  const handleSubmit = async () => {
    if (!selectedVehicle) {
      toast({
        title: "Hata",
        description: "Lütfen araç seçin",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPaymentMethod) {
      toast({
        title: "Hata",
        description: "Lütfen ödeme yöntemi seçin",
        variant: "destructive",
      });
      return;
    }

    if (!pickup) {
      toast({
        title: "Hata",
        description: "Lütfen alış konumunu seçin",
        variant: "destructive",
      });
      return;
    }

    if (!dropoff) {
      toast({
        title: "Hata",
        description: "Lütfen varış konumunu seçin",
        variant: "destructive",
      });
      return;
    }

    // Rezervasyon kontrolü
    if (isReservation) {
      if (!scheduledDate || !scheduledTime) {
        toast({
          title: "Hata",
          description: "Lütfen rezervasyon tarihi ve saati seçin",
          variant: "destructive",
        });
        return;
      }

      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);
      const now = new Date();
      const minReservationTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 dakika sonra

      if (scheduledAt < minReservationTime) {
        toast({
          title: "Hata",
          description: "Rezervasyon en az 30 dakika sonra olmalıdır",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const body: any = {
        vehicleId: selectedVehicle,
        paymentMethodId: selectedPaymentMethod,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        pickupAddress: pickup.address,
        dropoffLat: dropoff.lat,
        dropoffLng: dropoff.lng,
        dropoffAddress: dropoff.address,
        notes,
      };

      // Rezervasyon bilgilerini ekle
      if (isReservation && scheduledDate && scheduledTime) {
        body.isReservation = true;
        body.scheduledAt = `${scheduledDate}T${scheduledTime}`;
      }

      const res = await fetch("/api/rides/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: isReservation ? "Rezervasyon Oluşturuldu" : "Talep Oluşturuldu",
          description: isReservation 
            ? "Rezervasyonunuz kaydedildi. Sürücüye bildirim gönderilecek."
            : "Sürücülerden teklif bekleniyor",
          variant: "success",
        });
        router.push(isReservation 
          ? `/musteri/rezervasyonlar` 
          : `/musteri/talep/${data.requestId}`
        );
      } else {
        toast({
          title: "Hata",
          description: data.error || "Talep oluşturulamadı",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Car className="h-5 w-5 text-green-600" />
            Araç Seçimi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
            <SelectTrigger>
              <SelectValue placeholder="Araç seçin" />
            </SelectTrigger>
            <SelectContent>
              {(vehicles ?? []).map((v: any) => (
                <SelectItem key={v?.id} value={v?.id}>
                  {v?.brand} {v?.model} - {v?.plate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Reservation Toggle */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Rezervasyon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reservation">İleri Tarihli Rezervasyon</Label>
              <p className="text-sm text-muted-foreground">
                {isReservation 
                  ? "Belirli bir saatte sürücü ayırtın" 
                  : "Hemen şimdi sürücü bulun"}
              </p>
            </div>
            <Switch
              id="reservation"
              checked={isReservation}
              onCheckedChange={setIsReservation}
            />
          </div>

          {isReservation && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Tarih
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required={isReservation}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Saat
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  required={isReservation}
                />
              </div>
              <p className="col-span-2 text-xs text-muted-foreground">
                * Rezervasyon en az 30 dakika sonra olmalıdır
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            Ödeme Yöntemi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods && paymentMethods.length > 0 ? (
            <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Kart seçin" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((pm: any) => (
                  <SelectItem key={pm?.id} value={pm?.id}>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {pm?.cardBrand || "Kart"} **** {pm?.cardLast4}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-center py-4">
              <CreditCard className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">Kayıtlı kart bulunamadı</p>
              <Link href="/musteri/profil/odeme?redirect=yeni-talep">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Kart Ekle
                </Button>
              </Link>
            </div>
          )}
          
          {/* Cancellation Warning */}
          <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
              <strong>Önemli:</strong> Teklifi kabul ettikten sonra vazgeçmeniz durumunda, 
              sürücünün kaybını karşılamak için <strong>teklif tutarının %30&apos;u</strong> kartınızdan tahsil edilecektir.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Location Selection - Navigation Style */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Navigation className="h-5 w-5 text-green-600" />
            Rota Belirle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pickup Input */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-green-600" />
              </div>
              <div className="flex-1 relative">
                <Input
                  ref={pickupInputRef}
                  placeholder="Alış noktası yazın..."
                  value={pickupSearch}
                  onChange={(e) => {
                    setPickupSearch(e.target.value);
                    if (!e.target.value) {
                      setPickup(null);
                      setPickupPredictions([]);
                    }
                  }}
                  onFocus={() => setActiveMap("pickup")}
                  className={`pr-10 ${pickup ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""}`}
                />
                {pickup && (
                  <button
                    type="button"
                    onClick={() => {
                      setPickup(null);
                      setPickupSearch("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="flex-shrink-0 border-green-500 text-green-600 hover:bg-green-50"
                title="Bulunduğum Yer"
              >
                {gettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LocateFixed className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Pickup Suggestions */}
            {pickupPredictions.length > 0 && (
              <div className="absolute z-50 left-10 right-12 mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {pickupPredictions.map((prediction) => (
                  <button
                    key={prediction.place_id}
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm hover:bg-muted flex items-center gap-3 border-b last:border-b-0"
                    onClick={() => selectPlace(prediction.place_id, "pickup")}
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="line-clamp-2">{prediction.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Connection Line */}
          <div className="flex items-center gap-2 ml-4">
            <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-600" />
          </div>

          {/* Dropoff Input */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 relative">
                <Input
                  ref={dropoffInputRef}
                  placeholder="Varış noktası yazın..."
                  value={dropoffSearch}
                  onChange={(e) => {
                    setDropoffSearch(e.target.value);
                    if (!e.target.value) {
                      setDropoff(null);
                      setDropoffPredictions([]);
                    }
                  }}
                  onFocus={() => setActiveMap("dropoff")}
                  className={`pr-10 ${dropoff ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : ""}`}
                />
                {dropoff && (
                  <button
                    type="button"
                    onClick={() => {
                      setDropoff(null);
                      setDropoffSearch("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Dropoff Suggestions */}
            {dropoffPredictions.length > 0 && (
              <div className="absolute z-50 left-10 right-0 mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {dropoffPredictions.map((prediction) => (
                  <button
                    key={prediction.place_id}
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm hover:bg-muted flex items-center gap-3 border-b last:border-b-0"
                    onClick={() => selectPlace(prediction.place_id, "dropoff")}
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="line-clamp-2">{prediction.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Saved Addresses for Dropoff - Quick Select */}
          {(savedAddresses?.length ?? 0) > 0 && (
            <div className="ml-10 pt-1">
              <Label className="text-xs text-muted-foreground mb-2 block flex items-center gap-1">
                <Star className="h-3 w-3" />
                Kayıtlı Adreslerim
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {(savedAddresses ?? []).map((addr: any) => {
                  const getIcon = (title: string) => {
                    const t = title?.toLowerCase() || "";
                    if (t.includes("ev") || t.includes("home")) return <Home className="h-4 w-4" />;
                    if (t.includes("iş") || t.includes("ofis") || t.includes("work") || t.includes("office")) return <Briefcase className="h-4 w-4" />;
                    return <Star className="h-4 w-4" />;
                  };
                  const isSelected = dropoff?.address === addr?.address;
                  return (
                    <button
                      key={addr?.id}
                      type="button"
                      onClick={() => {
                        setDropoff({ lat: addr?.lat, lng: addr?.lng, address: addr?.address });
                        setDropoffSearch(addr?.address);
                        setActiveMap("dropoff");
                        toast({
                          title: "Varış Noktası Seçildi",
                          description: addr?.title,
                          variant: "success",
                        });
                      }}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                        isSelected 
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" 
                          : "border-border hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
                      }`}
                    >
                      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                        isSelected ? "bg-blue-600 text-white" : "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                      }`}>
                        {getIcon(addr?.title)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{addr?.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{addr?.address}</div>
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0 text-blue-600">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Map */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-xs text-muted-foreground">
                {activeMap === "pickup" ? "Alış noktası seçin" : "Varış noktası seçin"} (haritaya tıklayarak da seçebilirsiniz)
              </Label>
              <div className="flex gap-1">
                <Button
                  variant={activeMap === "pickup" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveMap("pickup")}
                  className={activeMap === "pickup" ? "bg-green-600 h-7 text-xs" : "h-7 text-xs"}
                >
                  Alış
                </Button>
                <Button
                  variant={activeMap === "dropoff" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveMap("dropoff")}
                  className={activeMap === "dropoff" ? "bg-blue-600 h-7 text-xs" : "h-7 text-xs"}
                >
                  Varış
                </Button>
              </div>
            </div>
            <GoogleMap
              pickMode
              onLocationSelect={handleLocationSelect}
              className="w-full h-[250px] rounded-lg"
              markers={[
                ...(pickup ? [{ lat: pickup.lat, lng: pickup.lng, title: "Alış" }] : []),
                ...(dropoff ? [{ lat: dropoff.lat, lng: dropoff.lng, title: "Varış" }] : []),
              ]}
              showRoute={!!pickup && !!dropoff}
              origin={pickup || undefined}
              destination={dropoff || undefined}
            />
          </div>

          {/* Selected Locations Summary */}
          {(pickup || dropoff) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {pickup && (
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-green-600" />
                    <Label className="text-xs text-green-700 dark:text-green-400 font-medium">Alış Noktası</Label>
                  </div>
                  <p className="text-sm truncate">{pickup.address}</p>
                </div>
              )}
              {dropoff && (
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-3 w-3 text-blue-600" />
                    <Label className="text-xs text-blue-700 dark:text-blue-400 font-medium">Varış Noktası</Label>
                  </div>
                  <p className="text-sm truncate">{dropoff.address}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-green-600" />
            Notlar (Opsiyonel)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Sürücü için ek bilgiler..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={loading || !pickup || !dropoff || !selectedVehicle || !selectedPaymentMethod || (isReservation && (!scheduledDate || !scheduledTime))}
        className="w-full h-12 bg-green-600 hover:bg-green-700 text-lg"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Oluşturuluyor...
          </>
        ) : isReservation ? (
          <>
            <Calendar className="h-5 w-5 mr-2" />
            Rezervasyon Yap
          </>
        ) : (
          "Talep Oluştur"
        )}
      </Button>
    </div>
  );
}