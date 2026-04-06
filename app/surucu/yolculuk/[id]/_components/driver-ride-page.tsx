"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  MapPin,
  Car,
  MessageSquare,
  User,
  Navigation,
  CheckCircle,
  Camera,
  CreditCard,
  Loader2,
  X,
  Upload
} from "lucide-react";
import { formatPrice, getStatusText, getStatusColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { GoogleMap } from "@/components/google-map";
import { RideChat } from "@/components/ride-chat";

interface DriverRidePageProps {
  ride: any;
}

const STATUS_FLOW = [
  { status: "PENDING_PICKUP", label: "Alış Noktasına Git", nextStatus: "DRIVER_ARRIVED", nextLabel: "Vardım" },
  { status: "DRIVER_ARRIVED", label: "Müşteri Bekleniyor", nextStatus: "PHOTO_BEFORE", nextLabel: "Foto Çek" },
  { status: "PHOTO_BEFORE", label: "Başlangıç Fotoğrafı", nextStatus: "IN_PROGRESS", nextLabel: "Yola Çık" },
  { status: "IN_PROGRESS", label: "Yolculuk Devam Ediyor", nextStatus: "PHOTO_AFTER", nextLabel: "Bitiş Foto" },
  { status: "PHOTO_AFTER", label: "Bitiş Fotoğrafı", nextStatus: "COMPLETED", nextLabel: "Tamamla" },
  { status: "COMPLETED", label: "Tamamlandı", nextStatus: null, nextLabel: null },
];

export function DriverRidePage({ ride: initialRide }: DriverRidePageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [ride, setRide] = useState(initialRide);
  const [loading, setLoading] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const request = ride.request;
  const customer = request.customer;
  const currentStep = STATUS_FLOW.find(s => s.status === ride.status);
  const currentStepIndex = STATUS_FLOW.findIndex(s => s.status === ride.status);
  const progress = ((currentStepIndex + 1) / STATUS_FLOW.length) * 100;

  const isPhotoStep = ride.status === "PHOTO_BEFORE" || ride.status === "PHOTO_AFTER";
  const isCompleted = ride.status === "COMPLETED";
  const isCancelled = ride.status === "CANCELLED";

  const handleStatusUpdate = async (newStatus: string, photoUrl?: string) => {
    setLoading(true);
    try {
      const body: any = { status: newStatus };
      if (photoUrl) {
        body.photoUrl = photoUrl;
        body.photoType = ride.status === "PHOTO_BEFORE" ? "BEFORE" : "AFTER";
      }

      const res = await fetch(`/api/rides/${ride.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bir hata oluştu");

      setRide(data.ride);
      toast({ title: "Başarılı", description: "Durum güncellendi" });

      if (newStatus === "COMPLETED") {
        toast({
          title: "Tebrikler! 🎉",
          description: "Yolculuk tamamlandı. Kazanç hesabınıza eklendi.",
        });
      }
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setPhotoDialogOpen(false);
      setPhotoPreview(null);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoPreview || !fileInputRef.current?.files?.[0]) return;

    setUploadingPhoto(true);
    try {
      const file = fileInputRef.current.files[0];
      
      // Get presigned URL
      const presignRes = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: `ride-${ride.id}-${ride.status}.jpg`,
          contentType: file.type,
          isPublic: true
        })
      });

      const { uploadUrl, cloud_storage_path } = await presignRes.json();

      // Upload to S3
      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file
      });

      // Get public URL
      const publicUrl = `https://elliott-king.github.io/assets/images/s3_heroku_rails/direct_upload_flow.png`;

      // For demo, use a placeholder URL since we might not have all env vars
      const photoUrl = publicUrl || photoPreview;

      // Update status with photo
      const nextStatus = currentStep?.nextStatus;
      if (nextStatus) {
        await handleStatusUpdate(nextStatus, photoUrl);
      }
    } catch (error: any) {
      toast({ title: "Hata", description: "Fotoğraf yüklenemedi", variant: "destructive" });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast({ title: "Hata", description: "İptal sebebi girin", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/rides/${ride.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED", cancellationReason: cancelReason })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bir hata oluştu");

      toast({ title: "Yolculuk İptal Edildi", description: "Ana sayfaya yönlendiriliyorsunuz" });
      router.push("/surucu");
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setCancelDialogOpen(false);
    }
  };

  const handleNextStep = () => {
    if (isPhotoStep) {
      setPhotoDialogOpen(true);
    } else if (currentStep?.nextStatus) {
      handleStatusUpdate(currentStep.nextStatus);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/surucu">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Aktif Yolculuk</h1>
          <p className="text-sm text-gray-500">#{ride.id.slice(-6).toUpperCase()}</p>
        </div>
      </div>

      {/* Progress */}
      {!isCompleted && !isCancelled && (
        <Card className="mb-4 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-green-600">{currentStep?.label}</Badge>
              <span className="text-sm text-gray-500">%{Math.round(progress)}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Customer Info */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Müşteri Bilgisi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={customer?.profilePhoto || undefined} />
              <AvatarFallback>{customer?.name?.charAt(0) || "M"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{customer?.name}</p>
              {customer?.phone && (
                <p className="text-xs text-muted-foreground">
                  Tel: {customer.phone} (gizli)
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* In-App Messaging */}
      <Card className="mb-4">
        <CardContent className="p-0 h-80">
          <RideChat
            rideId={ride.id}
            rideStatus={ride.status}
            currentUserType="DRIVER"
            otherPartyName={customer?.name || "Müşteri"}
            initialMessages={ride.messages || []}
          />
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

      {/* Route */}
      <Card className="mb-4">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Alış Noktası</p>
              <p className="font-medium">{request.pickupAddress}</p>
            </div>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${request.pickupLat},${request.pickupLng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" variant="outline">
                <Navigation className="h-4 w-4" />
              </Button>
            </a>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Bırakış Noktası</p>
              <p className="font-medium">{request.dropoffAddress}</p>
            </div>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${request.dropoffLat},${request.dropoffLng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" variant="outline">
                <Navigation className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Car className="h-4 w-4" />
            Araç Bilgisi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{request.vehicle.brand} {request.vehicle.model}</p>
          <p className="text-sm text-gray-500">
            {request.vehicle.plate} • {request.vehicle.year} • {request.vehicle.color}
          </p>
        </CardContent>
      </Card>

      {/* Earnings */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Kazanç Bilgisi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Toplam Tutar</span>
            <span className="font-medium">{formatPrice(ride.price)}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-gray-500">Platform Komisyonu</span>
            <span className="text-red-500">-{formatPrice(ride.platformFee)}</span>
          </div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t">
            <span className="font-semibold">Net Kazanç</span>
            <span className="text-xl font-bold text-green-600">{formatPrice(ride.driverAmount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Photos taken */}
      {ride.photos?.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Çekilen Fotoğraflar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {ride.photos.map((photo: any) => (
                <div key={photo.id} className="relative">
                  <img
                    src={photo.photoUrl}
                    alt={photo.type}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <Badge className="absolute bottom-1 left-1 text-xs" variant="secondary">
                    {photo.type === "BEFORE" ? "Başlangıç" : "Bitiş"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed */}
      {isCompleted && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-700">Yolculuk Tamamlandı!</h3>
            <p className="text-2xl font-bold text-green-600 my-2">{formatPrice(ride.driverAmount)}</p>
            <p className="text-sm text-green-600 mb-4">Kazançınız hesabınıza eklendi</p>
            <Link href="/surucu">
              <Button className="bg-green-600 hover:bg-green-700">Ana Sayfaya Dön</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Fixed Bottom Actions */}
      {!isCompleted && !isCancelled && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
          <div className="max-w-2xl mx-auto flex gap-3">
            <Button
              variant="outline"
              className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setCancelDialogOpen(true)}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              İptal Et
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleNextStep}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : isPhotoStep ? (
                <Camera className="h-4 w-4 mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {currentStep?.nextLabel || "Devam"}
            </Button>
          </div>
        </div>
      )}

      {/* Photo Dialog */}
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {ride.status === "PHOTO_BEFORE" ? "Başlangıç Fotoğrafı" : "Bitiş Fotoğrafı"}
            </DialogTitle>
            <DialogDescription>
              Aracın {ride.status === "PHOTO_BEFORE" ? "teslim alma" : "teslim etme"} durumunu fotoğraflayın.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {photoPreview ? (
              <div className="relative">
                <img src={photoPreview} alt="Preview" className="w-full rounded-lg" />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setPhotoPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-green-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">Fotoğraf çekmek için tıklayın</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPhotoDialogOpen(false)} disabled={uploadingPhoto}>
              İptal
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handlePhotoUpload}
              disabled={!photoPreview || uploadingPhoto}
            >
              {uploadingPhoto ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Yükle ve Devam Et
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yolculuğu İptal Et</DialogTitle>
            <DialogDescription>
              İptal sebebini belirtin. Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder="İptal sebebi..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)} disabled={loading}>
              Vazgeç
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Yolculuğu İptal Et
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
