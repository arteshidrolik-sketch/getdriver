"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Car, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Navigation,
  Star
} from "lucide-react";
import { formatPrice, calculateDistance } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DriverReservationsListProps {
  upcomingReservations: any[];
  allReservations: any[];
  driverId: string;
}

export function DriverReservationsList({ 
  upcomingReservations, 
  allReservations,
  driverId 
}: DriverReservationsListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [offeringId, setOfferingId] = useState<string | null>(null);
  const [offerPrice, setOfferPrice] = useState<string>("");

  const handleOffer = async (requestId: string) => {
    if (!offerPrice) {
      toast({
        title: "Hata",
        description: "Lütfen bir fiyat girin",
        variant: "destructive",
      });
      return;
    }

    setOfferingId(requestId);
    try {
      const res = await fetch("/api/rides/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          price: parseFloat(offerPrice),
          estimatedArrival: 15,
          message: "Rezervasyon teklifi",
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Teklif Gönderildi",
          description: "Teklifiniz müşteriye iletildi",
        });
        setOfferPrice("");
        router.refresh();
      } else {
        toast({
          title: "Hata",
          description: data.error || "Teklif gönderilemedi",
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
      setOfferingId(null);
    }
  };

  const renderReservationCard = (reservation: any, isUrgent: boolean = false) => {
    const scheduledDate = reservation.scheduledAt 
      ? new Date(reservation.scheduledAt) 
      : null;
    
    const hasOffered = reservation.offers.length > 0;
    const myOffer = reservation.offers[0];

    return (
      <Card key={reservation.id} className={isUrgent ? "border-amber-500" : ""}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={reservation.customer?.profilePhoto} />
                <AvatarFallback>{reservation.customer?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{reservation.customer?.name}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  <Star className="h-3 w-3 inline text-amber-500" /> 4.5
                </p>
              </div>
            </div>
            {isUrgent && (
              <Badge className="bg-amber-100 text-amber-800">
                <Clock className="h-3 w-3 mr-1" />
                Yaklaşıyor
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Tarih/Saat */}
          {scheduledDate && (
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Calendar className="h-5 w-5 text-green-600" />
              {scheduledDate.toLocaleDateString('tr-TR', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
              <Clock className="h-5 w-5 text-blue-600 ml-2" />
              {scheduledDate.toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}

          {/* Güzergah */}
          <div className="space-y-1 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>{reservation.pickupAddress}</span>
            </div>
            <div className="flex items-start gap-2">
              <Navigation className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>{reservation.dropoffAddress}</span>
            </div>
          </div>

          {/* Araç */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Car className="h-4 w-4" />
            {reservation.vehicle?.brand} {reservation.vehicle?.model} - {reservation.vehicle?.plate}
          </div>

          {/* Notlar */}
          {reservation.notes && (
            <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
              <AlertCircle className="h-3 w-3 inline mr-1" />
              {reservation.notes}
            </div>
          )}

          {/* Teklif Durumu */}
          {hasOffered ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">
                Teklifiniz: {formatPrice(myOffer.price)} TL
              </span>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Fiyat (TL)"
                value={offeringId === reservation.id ? offerPrice : ""}
                onChange={(e) => {
                  setOfferingId(reservation.id);
                  setOfferPrice(e.target.value);
                }}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
                min="50"
              />
              <Button
                size="sm"
                onClick={() => handleOffer(reservation.id)}
                disabled={offeringId === reservation.id && loadingId === reservation.id}
                className="bg-green-600 hover:bg-green-700"
              >
                {offeringId === reservation.id && loadingId === reservation.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Teklif Ver"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (allReservations.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Rezervasyon Yok</h3>
          <p className="text-muted-foreground">
            Yakın zamanda başlayacak rezervasyon bulunmuyor
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Yaklaşan Rezervasyonlar */}
      {upcomingReservations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            1 Saat İçinde Başlayacak ({upcomingReservations.length})
          </h2>
          {upcomingReservations.map((reservation) => 
            renderReservationCard(reservation, true)
          )}
        </div>
      )}

      {/* Sonraki Rezervasyonlar */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-600" />
          Sonraki 24 Saat ({allReservations.length})
        </h2>
        {allReservations
          .filter((r) => !upcomingReservations.find((u) => u.id === r.id))
          .map((reservation) => renderReservationCard(reservation))}
      </div>
    </div>
  );
}
