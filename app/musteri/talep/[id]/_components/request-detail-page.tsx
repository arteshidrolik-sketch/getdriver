"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  MapPin,
  Car,
  Clock,
  Star,
  CheckCircle,
  User,
  MessageSquare,
  Loader2,
  Navigation,
  AlertTriangle
} from "lucide-react";
import { formatPrice, formatDate, getStatusText, getStatusColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface RequestDetailPageProps {
  request: any;
}

export function RequestDetailPage({ request }: RequestDetailPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAcceptOffer = async () => {
    if (!selectedOffer) return;

    setLoading(true);
    try {
      const res = await fetch("/api/rides/offer/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId: selectedOffer.id })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bir hata oluştu");

      toast({
        title: "Teklif Kabul Edildi!",
        description: "Sürücü yolda. Yolculuk sayfasına yönlendiriliyorsunuz.",
      });

      // Redirect to ride page
      router.push(`/musteri/yolculuk/${data.rideId}`);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setAcceptDialogOpen(false);
    }
  };

  const isExpired = new Date(request.expiresAt) < new Date();
  const isAccepted = request.status === "ACCEPTED";
  const isCancelled = request.status === "CANCELLED";

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/musteri">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Talep Detayı</h1>
          <p className="text-sm text-gray-500">{formatDate(request.createdAt)}</p>
        </div>
      </div>

      {/* Status */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(request.status)}>
                {getStatusText(request.status)}
              </Badge>
              {isExpired && request.status === "ACTIVE" && (
                <Badge variant="secondary">Süresi Dolmuş</Badge>
              )}
            </div>
            {request.ride && (
              <Link href={`/musteri/yolculuk/${request.ride.id}`}>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Navigation className="h-4 w-4 mr-2" />
                  Yolculuğa Git
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Route Info */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Güzergah</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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

      {/* Notes */}
      {request.notes && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Notlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{request.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Offers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Gelen Teklifler
            </span>
            <Badge variant="secondary">{request.offers.length} teklif</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {request.offers.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Henüz teklif gelmedi</p>
              <p className="text-sm text-gray-400">Sürücüler tekliflerini gönderiyor...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {request.offers.map((offer: any) => (
                <div
                  key={offer.id}
                  className={`p-4 rounded-lg border transition-all ${
                    offer.status === "ACCEPTED"
                      ? "border-green-300 bg-green-50"
                      : offer.status === "REJECTED"
                      ? "border-gray-200 bg-gray-50 opacity-60"
                      : "border-gray-200 hover:border-green-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={offer.driver?.user?.profilePhoto || undefined} />
                        <AvatarFallback>
                          {offer.driver?.user?.name?.charAt(0) || "S"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{offer.driver?.user?.name}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="flex items-center text-amber-500">
                            <Star className="h-3.5 w-3.5 mr-0.5 fill-current" />
                            {(offer.driver?.ratingAvg || 0).toFixed(1)}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">{offer.driver?.totalRides || 0} sürüş</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>~{offer.estimatedArrival} dk varış</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">{formatPrice(offer.price)}</p>
                      {offer.status === "ACCEPTED" ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Kabul Edildi
                        </Badge>
                      ) : offer.status === "REJECTED" ? (
                        <Badge variant="secondary">Reddedildi</Badge>
                      ) : (
                        request.status === "ACTIVE" && !isExpired && (
                          <Button
                            size="sm"
                            className="mt-2 bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setSelectedOffer(offer);
                              setAcceptDialogOpen(true);
                            }}
                          >
                            Kabul Et
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                  {offer.message && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600 italic">"{offer.message}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accept Dialog */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Teklifi Kabul Et</DialogTitle>
            <DialogDescription>
              Bu teklifi kabul etmek istediğinizden emin misiniz?
            </DialogDescription>
          </DialogHeader>
          
          {selectedOffer && (
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedOffer.driver?.user?.profilePhoto || undefined} />
                  <AvatarFallback>
                    {selectedOffer.driver?.user?.name?.charAt(0) || "S"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedOffer.driver?.user?.name}</p>
                  <p className="text-sm text-gray-500">~{selectedOffer.estimatedArrival} dk içinde varış</p>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-sm text-gray-500 mb-1">Toplam Tutar</p>
                <p className="text-2xl font-bold text-green-600">{formatPrice(selectedOffer.price)}</p>
              </div>
              
              {/* Cancellation Warning */}
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-sm">
                  <strong>Dikkat:</strong> Teklifi kabul ettikten sonra vazgeçerseniz, 
                  sürücünün kaybını karşılamak için <strong>{formatPrice(selectedOffer.price * 0.3)}</strong> (tutarın %30&apos;u) kartınızdan tahsil edilecektir.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptDialogOpen(false)} disabled={loading}>
              İptal
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleAcceptOffer} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Onayla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
