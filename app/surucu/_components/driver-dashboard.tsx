"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Power, MapPin, Clock, Wallet, Star, AlertTriangle, Navigation, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatPrice, getStatusText, getStatusColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DriverDashboardProps {
  driver: any;
  todayRides: number;
  todayEarnings: number;
}

export function DriverDashboard({ driver, todayRides, todayEarnings }: DriverDashboardProps) {
  const [isOnline, setIsOnline] = useState(driver?.isOnline || false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const isPending = driver?.approvalStatus === "PENDING";
  const isRejected = driver?.approvalStatus === "REJECTED";
  const isApproved = driver?.approvalStatus === "APPROVED";
  const activeRide = driver?.rides?.[0];

  const toggleOnline = async () => {
    if (!isApproved) return;

    setLoading(true);
    try {
      // Get current location
      let lat: number | undefined;
      let lng: number | undefined;

      if (!isOnline && navigator.geolocation) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              lat = pos.coords.latitude;
              lng = pos.coords.longitude;
              resolve();
            },
            () => resolve(),
            { timeout: 5000 }
          );
        });
      }

      const res = await fetch("/api/driver/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: !isOnline, lat, lng }),
      });

      const data = await res.json();
      if (data.success) {
        setIsOnline(!isOnline);
        toast({
          title: !isOnline ? "Çevrimİçi" : "Çevrimdışı",
          description: !isOnline ? "Artık teklif alabilirsiniz" : "Talep almayı durdurdunuz",
        });
      } else {
        toast({
          title: "Hata",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Durum güncellenemedi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Pending Approval */}
      {isPending && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-6 text-center">
            <Clock className="h-12 w-12 mx-auto text-amber-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Başvurunuz İnceleniyor</h2>
            <p className="text-muted-foreground">
              Belgeleriniz admin tarafından inceleniyor. Onay sonrası sürücülük yapmaya başlayabilirsiniz.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Rejected */}
      {isRejected && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Başvurunuz Reddedildi</h2>
            <p className="text-muted-foreground mb-2">
              {driver?.rejectionReason || "Belgeleriniz onaylanmadı."}
            </p>
            <Link href="/surucu/profil">
              <Button variant="outline">Belgelerimi Güncelle</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Approved - Main Dashboard */}
      {isApproved && (
        <>
          {/* Online Status Toggle */}
          <Card className={isOnline ? "border-green-500 bg-green-50/50 dark:bg-green-950/20" : ""}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${isOnline ? "bg-green-100" : "bg-gray-100"}`}>
                    <Power className={`h-8 w-8 ${isOnline ? "text-green-600" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {isOnline ? "Çevrimİçi" : "Çevrimdışı"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {isOnline ? "Yeni talepler alıyorsunuz" : "Talep almayı başlatın"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isOnline}
                  onCheckedChange={toggleOnline}
                  disabled={loading || !!activeRide}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Active Ride */}
          {activeRide && (
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-blue-600 animate-pulse" />
                  Aktif Sürüş
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={activeRide?.request?.customer?.profilePhoto} />
                      <AvatarFallback>{activeRide?.request?.customer?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{activeRide?.request?.customer?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {activeRide?.request?.vehicle?.brand} {activeRide?.request?.vehicle?.model}
                      </p>
                      <Badge className={getStatusColor(activeRide?.status)}>
                        {getStatusText(activeRide?.status)}
                      </Badge>
                    </div>
                  </div>
                  <Link href={`/surucu/yolculuk/${activeRide?.id}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700">Devam Et</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Today's Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                    <Wallet className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bugünkü Kazanç</p>
                    <p className="text-2xl font-bold text-green-600">{formatPrice(todayEarnings)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                    <Navigation className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bugün Tamamlanan</p>
                    <p className="text-2xl font-bold">{todayRides} Sürüş</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rating & Stats */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                    <Star className="h-6 w-6 fill-current" />
                    <span className="text-2xl font-bold">{(driver?.ratingAvg || 0).toFixed(1)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{driver?.ratingCount || 0} Değerlendirme</p>
                </div>
                <div className="h-12 w-px bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-bold">{driver?.totalRides || 0}</p>
                  <p className="text-sm text-muted-foreground">Toplam Sürüş</p>
                </div>
                <div className="h-12 w-px bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{formatPrice(driver?.totalEarnings || 0)}</p>
                  <p className="text-sm text-muted-foreground">Toplam Kazanç</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          {isOnline && !activeRide && (
            <Link href="/surucu/talepler">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-semibold">Yakındaki Talepleri Gör</h3>
                      <p className="text-sm text-muted-foreground">Teklif verin ve kazanın</p>
                    </div>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700">Görüntüle</Button>
                </CardContent>
              </Card>
            </Link>
          )}
        </>
      )}
    </div>
  );
}