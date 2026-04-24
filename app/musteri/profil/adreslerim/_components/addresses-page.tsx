"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Trash2, ArrowLeft, Star, Loader2, Home, Building2, Search, X, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { GoogleMap } from "@/components/google-map";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface PlacePrediction {
  place_id: string;
  description: string;
}

interface AddressesPageProps {
  addresses: any[];
}

export function AddressesPage({ addresses: initialAddresses }: AddressesPageProps) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [isDefault, setIsDefault] = useState(false);
  
  // Search states
  const [addressSearch, setAddressSearch] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const skipSearchRef = useRef(false);
  
  const router = useRouter();
  const { toast } = useToast();

  // Search places using backend API
  const searchPlaces = useCallback(async (query: string) => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }
    
    if (!query || query.length < 3) {
      setPredictions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.predictions) {
        setPredictions(data.predictions);
      }
    } catch (error) {
      console.error("Places search error:", error);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(addressSearch);
    }, 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [addressSearch, searchPlaces]);
  
  // Close predictions when dialog closes
  useEffect(() => {
    if (!dialogOpen) {
      setPredictions([]);
    }
  }, [dialogOpen]);

  // Select place from predictions
  const selectPlace = async (placeId: string) => {
    // Clear predictions immediately to hide dropdown
    setPredictions([]);
    skipSearchRef.current = true;
    
    try {
      const res = await fetch(`/api/places/details?place_id=${placeId}`);
      const data = await res.json();
      
      // API returns { lat, lng, address } directly
      if (data.lat !== undefined && data.lng !== undefined && data.address) {
        setLat(data.lat);
        setLng(data.lng);
        setAddress(data.address);
        setAddressSearch(data.address);
        
        toast({
          title: "Adres Seçildi",
          description: data.address.length > 50 ? data.address.substring(0, 50) + "..." : data.address,
          variant: "success",
        });
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Place details error:", error);
      toast({
        title: "Hata",
        description: "Adres detayları alınamadı",
        variant: "destructive",
      });
    }
  };

  // Handle map click
  const handleMapClick = async (clickLat: number, clickLng: number, clickAddress: string) => {
    skipSearchRef.current = true;
    setPredictions([]);
    setLat(clickLat);
    setLng(clickLng);
    setAddress(clickAddress);
    setAddressSearch(clickAddress);
  };

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
        
      // Reverse geocode using backend API
        try {
          const response = await fetch(`/api/geocode/reverse?lat=${latitude}&lng=${longitude}`);
          const data = await response.json();
          const foundAddress = data.address || "Mevcut Konum";
          
          setLat(latitude);
          setLng(longitude);
          setAddress(foundAddress);
          setAddressSearch(foundAddress);
          toast({
            title: "Konum Alındı",
            description: "Adres mevcut konumunuz olarak ayarlandı",
            variant: "success",
          });
        } catch (error) {
          setLat(latitude);
          setLng(longitude);
          setAddress("Mevcut Konum");
          setAddressSearch("Mevcut Konum");
        }
        setGettingLocation(false);
      },
      (error) => {
        setGettingLocation(false);
        let errorMessage = "Konum alınamadı";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Konum izni reddedildi";
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

  // Reset form
  const resetForm = () => {
    setTitle("");
    setAddress("");
    setAddressSearch("");
    setLat(null);
    setLng(null);
    setIsDefault(false);
    setPredictions([]);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({ title: "Hata", description: "Adres başlığı girin", variant: "destructive" });
      return;
    }
    if (!address.trim() || lat === null || lng === null) {
      toast({ title: "Hata", description: "Lütfen haritadan veya arama ile adres seçin", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/customer/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          address: address.trim(),
          lat,
          lng,
          isDefault,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({ title: "Başarılı", description: "Adres eklendi", variant: "success" });
        setDialogOpen(false);
        resetForm();
        router.refresh();
        setAddresses(prev => {
          if (isDefault) {
            return [data.address, ...prev.map((a: any) => ({ ...a, isDefault: false }))];
          }
          return [...prev, data.address];
        });
      } else {
        toast({ title: "Hata", description: data.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Hata", description: "Adres eklenemedi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/customer/addresses?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Başarılı", description: "Adres silindi" });
        setAddresses(prev => prev.filter((a: any) => a.id !== id));
        router.refresh();
      } else {
        toast({ title: "Hata", description: data.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Hata", description: "Adres silinemedi", variant: "destructive" });
    }
  };

  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("ev") || t.includes("home")) return Home;
    if (t.includes("iş") || t.includes("ofis") || t.includes("work")) return Building2;
    return MapPin;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/musteri/profil">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Kayıtlı Adreslerim</h1>
      </div>

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium">Kayıtlı adres yok</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sık kullandığınız adresleri kaydedin
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr: any) => {
            const Icon = getIcon(addr.title);
            return (
              <Card key={addr.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-start">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900 mr-3">
                    <Icon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{addr.title}</p>
                      {addr.isDefault && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          <Star className="h-3 w-3 mr-1" />
                          Varsayılan
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{addr.address}</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Adresi Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bu adresi silmek istediğinize emin misiniz?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleDelete(addr.id)}
                        >
                          Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Address Button */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogTrigger asChild>
          <Button className="w-full bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Adres Ekle
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-visible" style={{ overflow: predictions.length > 0 ? 'visible' : 'auto' }}>
          <DialogHeader>
            <DialogTitle>Yeni Adres Ekle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAddress} className="space-y-4">
            {/* Title Input */}
            <div className="space-y-2">
              <Label>Adres Başlığı</Label>
              <Input
                placeholder="Örn: Ev, İş, Anne Evi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Address Search with Autocomplete */}
            <div className="space-y-2">
              <Label>Adres Ara</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    ref={addressInputRef}
                    placeholder="Adres yazın veya haritadan seçin..."
                    value={addressSearch}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAddressSearch(val);
                      if (!val) {
                        setAddress("");
                        setLat(null);
                        setLng(null);
                        setPredictions([]);
                      }
                    }}
                    className={`pl-10 pr-10 ${lat !== null ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""}`}
                  />
                  {addressSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setAddressSearch("");
                        setAddress("");
                        setLat(null);
                        setLng(null);
                        setPredictions([]);
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
              
              {/* Autocomplete Suggestions - Direct render with high z-index */}
              {predictions.length > 0 && (
                <div 
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl max-h-48 overflow-y-auto"
                  style={{ position: 'relative', zIndex: 99999 }}
                >
                  {predictions.map((prediction) => (
                    <div
                      key={prediction.place_id}
                      role="option"
                      tabIndex={0}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-green-50 dark:hover:bg-green-900/30 cursor-pointer flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0 transition-colors active:bg-green-100"
                      onMouseDown={(e) => {
                        // Prevent input blur which would close dropdown
                        e.preventDefault();
                      }}
                      onClick={() => {
                        console.log("Clicked on prediction:", prediction.place_id);
                        selectPlace(prediction.place_id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          selectPlace(prediction.place_id);
                        }
                      }}
                    >
                      <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="line-clamp-2">{prediction.description}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {searchLoading && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Aranıyor...
                </p>
              )}
            </div>

            {/* Map */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Haritaya tıklayarak da konum seçebilirsiniz
              </Label>
              <GoogleMap
                pickMode
                onLocationSelect={handleMapClick}
                className="w-full h-[200px] rounded-lg"
                markers={lat !== null && lng !== null ? [{ lat, lng, title: title || "Seçilen Konum" }] : []}
              />
            </div>

            {/* Selected Address Display */}
            {address && lat !== null && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">Seçilen Adres</p>
                    <p className="text-xs text-green-600 dark:text-green-400">{address}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Default Switch */}
            <div className="flex items-center justify-between">
              <Label htmlFor="default">Varsayılan adres olarak ayarla</Label>
              <Switch
                id="default"
                checked={isDefault}
                onCheckedChange={setIsDefault}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}>
                İptal
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading || lat === null}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Adresi Ekle
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
