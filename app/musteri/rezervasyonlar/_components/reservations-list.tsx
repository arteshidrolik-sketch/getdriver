"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Car, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Bell
} from "lucide-react";
import { formatPrice, getStatusText, getStatusColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ReservationsListProps {
  reservations: any[];
}

export function ReservationsList({ reservations }: ReservationsListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleNotify = async (reservationId: string) => {
    setLoadingId(reservationId);
    try {
      const res = await fetch("/api/rides/reservation/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: reservationId }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Bildirim Gönderildi",
          description: data.message,
        });
        router.refresh();
      } else {
        toast({
          title: "Hata",
          description: data.error || "Bildirim gönderilemedi",
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
      setLoadingId(null);
    }
  };

  const handleCancel = async (reservationId: string) => {
    if (!confirm("Rezervasyonu iptal etmek istediğinizden emin misiniz?")) {
      return;
    }

    setLoadingId(reservationId);
    try {
      const res = await fetch(`/api/rides/request?id=${reservationId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Rezervasyon İptal Edildi",
          description: "Rezervasyonunuz başarıyla iptal edildi",
        });
        router.refresh();
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
      setLoadingId(null);
    }
  };

  if (reservations.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Rezervasyonunuz Yok</h3>
          <p className="text-muted-foreground mb-4">
            İleri tarihli sürüş rezervasyonu yapabilirsiniz
          </p>
          <Link href="/musteri/yeni-talep">
            <Button className="bg-green-600 hover:bg-green-700">
              Yeni Rezervasyon Yap
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => {
        const scheduledDate = reservation.scheduledAt 
          ? new Date(reservation.scheduledAt) 
          : null;
        
        const isPast = scheduledDate && scheduledDate < new Date();
        const isNotified = !!reservation.notifiedAt;
        const hasOffer = reservation.offers.length > 0;
        const hasAcceptedOffer = reservation.offers.some((o: any) => o.status === "ACCEPTED");

        return (
          <Card key={reservation.id} className={isPast ? "opacity-60" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  {scheduledDate ? scheduledDate.toLocaleDateString('tr-TR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 'Tarih Belirtilmemiş'}
                </CardTitle>
                <Badge className={getStatusColor(reservation.status)}>
                  {getStatusText(reservation.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Saat */}
              {scheduledDate && (
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Clock className="h-5 w-5 text-blue-600" />
                  {scheduledDate.toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              )}

              {/* Güzergah */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Alış</p>
                    <p className="text-sm">{reservation.pickupAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Varış</p>
                    <p className="text-sm">{reservation.dropoffAddress}</p>
                  </div>
                </div>
              </div>

              {/* Araç */}
              <div className="flex items-center gap-2 text-sm">
                <Car className="h-4 w-4 text-muted-foreground" />
                {reservation.vehicle?.brand} {reservation.vehicle?.model} - {reservation.vehicle?.plate}
              </div>

              {/* Notlar */}
              {reservation.notes && (
                <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                  <AlertCircle className="h-3 w-3 inline mr-1" />
                  {reservation.notes}
                </div>
              )}

              {/* Durum Bilgisi */}
              <div className="flex items-center gap-2 text-sm">
                {hasAcceptedOffer ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Sürücü onaylandı</span>
                  </>
                ) : hasOffer ? (
                  <>
                    <Bell className="h-4 w-4 text-amber-600" />
                    <span className="text-amber-600">Teklifler bekleniyor</span>
                  </>
                ) : isNotified ? (
                  <>
                    <Bell className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-600">Sürücülere bildirim gönderildi</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400">Bildirim bekleniyor</span>
                  </>
                )}
              </div>

              {/* Aksiyonlar */}
              <div className="flex gap-2 pt-2">
                {!isPast && reservation.status === "ACTIVE" && (
                  <>
                    {!isNotified && !hasOffer && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleNotify(reservation.id)}
                        disabled={loadingId === reservation.id}
                        className="flex-1"
                      >
                        {loadingId === reservation.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Bell className="h-4 w-4 mr-1" />
                            Sürücülere Bildir
                          </>
                        )}
                      </Button>
                    )}
                    
                    {hasOffer && (
                      <Link href={`/musteri/talep/${reservation.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Teklifleri Gör
                        </Button>
                      </Link>
                    )}

                    {!hasAcceptedOffer && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(reservation.id)}
                        disabled={loadingId === reservation.id}
                        className="text-red-600 hover:bg-red-50"
                      >
                        {loadingId === reservation.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            İptal
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}

                {reservation.ride && (
                  <Link href={`/musteri/yolculuk/${reservation.ride.id}`} className="flex-1">
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                      Yolculuğa Git
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Link href="/musteri/yeni-talep">
        <Button className="w-full bg-green-600 hover:bg-green-700">
          Yeni Rezervasyon Yap
        </Button>
      </Link>
    </div>
  );
}
