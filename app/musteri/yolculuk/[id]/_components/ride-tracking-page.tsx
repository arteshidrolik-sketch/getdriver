"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  MapPin,
  Car,
  MessageSquare,
  Star,
  Navigation,
  CheckCircle,
  Clock,
  Camera,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  XCircle,
  Loader2
} from "lucide-react";
import { formatPrice, formatDate, getStatusText, getStatusColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { GoogleMap } from "@/components/google-map";

interface RideTrackingPageProps {
  ride: any;
}

const RIDE_STEPS = [
  { status: "PENDING_PICKUP", label: "Sürücü Yolda", icon: Navigation },
  { status: "DRIVER_ARRIVED", label: "Sürücü Geldi", icon: MapPin },
  { status: "PHOTO_BEFORE", label: "Başlangıç Foto", icon: Camera },
  { status: "IN_PROGRESS", label: "Yolculuk", icon: Car },
  { status: "PHOTO_AFTER", label: "Bitiş Foto", icon: Camera },
  { status: "COMPLETED", label: "Tamamlandı", icon: CheckCircle },
];

export function RideTrackingPage({ ride: initialRide }: RideTrackingPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [ride, setRide] = useState(initialRide);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const currentStepIndex = RIDE_STEPS.findIndex(s => s.status === ride.status);
  const progress = ((currentStepIndex + 1) / RIDE_STEPS.length) * 100;
  const cancellationFee = ride.price * 0.3;

  const refreshRide = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/rides/${ride.id}`);
      if (res.ok) {
        const data = await res.json();
        setRide(data.ride);
      }
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelRide = async () => {
    setCancelling(true);
    try {
      const res = await fetch("/api/rides/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          rideId: ride.id, 
          reason: cancelReason || "Müşteri tarafından iptal edildi" 
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast({
          title: "Yolculuk İptal Edildi",
          description: `İptal ücreti olarak ${formatPrice(cancellationFee)} kartınızdan tahsil edilecektir.`,
          variant: "destructive",
        });
        setCancelDialogOpen(false);
        router.push("/musteri");
      } else {
        toast({
          title: "Hata",
          description: data.error || "İptal işlemi başarısız",
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
      setCancelling(false);
    }
  };

  // Auto-refresh every 10 seconds for active rides
  useEffect(() => {
    if (ride.status !== "COMPLETED" && ride.status !== "CANCELLED") {
      const interval = setInterval(refreshRide, 10000);
      return () => clearInterval(interval);
    }
  }, [ride.status]);

  const driver = ride.driver;
  const request = ride.request;
  const isCompleted = ride.status === "COMPLETED";
  const isCancelled = ride.status === "CANCELLED";

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/musteri">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Yolculuk Takibi</h1>
            <p className="text-sm text-gray-500">#{ride.id.slice(-6).toUpperCase()}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={refreshRide} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Yenile
        </Button>
      </div>

      {/* Status Progress */}
      {!isCancelled && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Badge className={getStatusColor(ride.status)}>
                {getStatusText(ride.status)}
              </Badge>
              <span className="text-sm text-gray-500">%{Math.round(progress)}</span>
            </div>
            <Progress value={progress} className="h-2 mb-4" />
            <div className="flex justify-between">
              {RIDE_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStepIndex;
                return (
                  <div key={step.status} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={`text-xs mt-1 ${isActive ? "text-green-600" : "text-gray-400"}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancelled Status */}
      {isCancelled && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="font-semibold text-red-700">İptal Edildi</p>
                <p className="text-sm text-red-600">{ride.cancellationReason || "Yolculuk iptal edildi"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Driver Info */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Sürücü Bilgisi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14">
              <AvatarImage src={driver?.user?.profilePhoto || undefined} />
              <AvatarFallback className="text-lg">
                {driver?.user?.name?.charAt(0) || "S"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{driver?.user?.name}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center text-amber-500">
                  <Star className="h-4 w-4 mr-0.5 fill-current" />
                  {(driver?.ratingAvg || 0).toFixed(1)}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">{driver?.totalRides || 0} sürüş</span>
              </div>
              {driver?.user?.phone && (
                <p className="text-xs text-muted-foreground mt-1">
                  Tel: {driver.user.phone} (gizli)
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card className="mb-4">
        <CardContent className="p-0">
          <div className="h-48 rounded-lg overflow-hidden">
            <GoogleMap
              className="w-full h-full"
              markers={[
                { lat: request.pickupLat, lng: request.pickupLng, title: "Alış" },
                { lat: request.dropoffLat, lng: request.dropoffLng, title: "Bırakış" }
              ]}
              showRoute
              origin={{ lat: request.pickupLat, lng: request.pickupLng }}
              destination={{ lat: request.dropoffLat, lng: request.dropoffLng }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Route Info */}
      <Card className="mb-4">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
            <div>
              <p className="text-sm text-gray-500">Alış Noktası</p>
              <p className="font-medium">{request.pickupAddress}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5" />
            <div>
              <p className="text-sm text-gray-500">Bırakış Noktası</p>
              <p className="font-medium">{request.dropoffAddress}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Info */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Car className="h-4 w-4" />
            Araç Bilgisi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">
            {request.vehicle.brand} {request.vehicle.model}
          </p>
          <p className="text-sm text-gray-500">
            {request.vehicle.plate} • {request.vehicle.year} • {request.vehicle.color}
          </p>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Ödeme Bilgisi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Toplam Tutar</span>
            <span className="text-xl font-bold text-green-600">{formatPrice(ride.price)}</span>
          </div>
          {ride.payment && (
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-500">Ödeme Durumu</span>
              <Badge className={ride.payment.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                {ride.payment.status === "COMPLETED" ? "Ödendi" : "Bekliyor"}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photos */}
      {ride.photos?.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Araç Fotoğrafları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {ride.photos.map((photo: any) => (
                <div key={photo.id} className="relative">
                  <img
                    src={photo.photoUrl}
                    alt={photo.type}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Badge className="absolute bottom-2 left-2" variant="secondary">
                    {photo.type === "BEFORE" ? "Başlangıç" : "Bitiş"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Actions */}
      {isCompleted && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-700">Yolculuk Tamamlandı!</h3>
            <p className="text-sm text-green-600 mb-4">Teşekkür ederiz, iyi yolculuklar!</p>
            <div className="flex gap-2 justify-center">
              <Link href="/musteri">
                <Button variant="outline">Ana Sayfa</Button>
              </Link>
              <Link href="/musteri/gecmis">
                <Button className="bg-green-600 hover:bg-green-700">Geçmişe Git</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Button - Only show for active rides */}
      {!isCompleted && !isCancelled && (
        <Card className="border-red-200">
          <CardContent className="p-4">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => setCancelDialogOpen(true)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Yolculuğu İptal Et
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              İptal ücreti: {formatPrice(cancellationFee)} (tutarın %30&apos;u)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Yolculuğu İptal Et
            </DialogTitle>
            <DialogDescription>
              Yolculuğu iptal etmek istediğinizden emin misiniz?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                <strong>Dikkat:</strong> İptal işlemi sonucunda sürücünün kaybını karşılamak için 
                <strong> {formatPrice(cancellationFee)}</strong> (tutarın %30&apos;u) kartınızdan tahsil edilecektir.
              </AlertDescription>
            </Alert>
            
            <div>
              <label className="text-sm font-medium mb-2 block">İptal Sebebi (Opsiyonel)</label>
              <Textarea 
                placeholder="İptal sebebinizi yazın..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)} disabled={cancelling}>
              Vazgeç
            </Button>
            <Button variant="destructive" onClick={handleCancelRide} disabled={cancelling}>
              {cancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  İptal Ediliyor...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  İptal Et ({formatPrice(cancellationFee)})
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
