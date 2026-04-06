"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, Plus, MapPin, Clock, Star, CheckCircle2, AlertCircle, Navigation, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, getStatusText, getStatusColor } from "@/lib/utils";

interface CustomerDashboardProps {
  userName: string;
  activeRequests: any[];
  activeRide: any | null;
  vehicleCount: number;
}

export function CustomerDashboard({
  userName,
  activeRequests,
  activeRide,
  vehicleCount,
}: CustomerDashboardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const firstName = userName?.split(" ")?.[0] || "";
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingRequestId, setDeletingRequestId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent, requestId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingRequestId(requestId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRequestId) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/rides/request?id=${deletingRequestId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Talep iptal edilemedi");
      }

      toast({
        title: "Başarılı",
        description: "Talep başarıyla iptal edildi",
      });

      router.refresh();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDeletingRequestId(null);
    }
  };

  // Check if a request can be cancelled (ACTIVE and no accepted offers)
  const canCancelRequest = (request: any) => {
    if (request.status !== "ACTIVE") return false;
    const hasAcceptedOffer = request.offers?.some((o: any) => o.status === "ACCEPTED");
    return !hasAcceptedOffer;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Merhaba, {firstName}! 👋</h1>
        <p className="text-muted-foreground">Güvenli yolculuklar dileriz</p>
      </div>

      {/* Active Ride */}
      {activeRide && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Navigation className="h-5 w-5 text-green-600 animate-pulse" />
              Aktif Yolculuk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={activeRide.driver?.user?.profilePhoto} />
                  <AvatarFallback>{activeRide.driver?.user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{activeRide.driver?.user?.name}</p>
                  <Badge className={getStatusColor(activeRide.status)}>
                    {getStatusText(activeRide.status)}
                  </Badge>
                </div>
              </div>
              <Link href={`/musteri/yolculuk/${activeRide.id}`}>
                <Button className="bg-green-600 hover:bg-green-700">Takip Et</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/musteri/yeni-talep">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
            <CardContent className="pt-6 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Plus className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="font-semibold">Yeni Talep</h3>
              <p className="text-sm text-muted-foreground">Sürücü çağır</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/musteri/profil/araclarim">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
            <CardContent className="pt-6 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Car className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="font-semibold">Aracını Seç</h3>
              <p className="text-sm text-muted-foreground">{vehicleCount} araç kayıtlı</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Active Requests */}
      {activeRequests?.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Aktif Talepler
          </h2>
          <div className="space-y-3">
            {(activeRequests ?? []).map((request: any) => (
              <Card key={request?.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">{request?.dropoffAddress}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {request?.vehicle?.brand} {request?.vehicle?.model} - {request?.vehicle?.plate}
                      </p>
                      <Badge className={getStatusColor(request?.status || "")}>
                        {getStatusText(request?.status || "")}
                      </Badge>
                    </div>
                    <div className="text-right space-y-2">
                      {(request?.offers?.length ?? 0) > 0 ? (
                        <Badge variant="info">
                          {request?.offers?.length ?? 0} teklif
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Teklif bekleniyor
                        </Badge>
                      )}
                      <div className="flex items-center gap-2 justify-end">
                        {canCancelRequest(request) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => handleDeleteClick(e, request?.id)}
                            title="Talebi İptal Et"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Link href={`/musteri/talep/${request?.id}`}>
                          <Button size="sm" variant="outline">
                            Detay
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Show offers preview */}
                  {(request?.offers?.length ?? 0) > 0 && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      {(request?.offers ?? []).slice(0, 2).map((offer: any) => (
                        <div key={offer?.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>{offer?.driver?.user?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{offer?.driver?.user?.name}</span>
                            <span className="flex items-center text-amber-500">
                              <Star className="h-3 w-3 mr-0.5 fill-current" />
                              {(offer?.driver?.ratingAvg ?? 0).toFixed(1)}
                            </span>
                          </div>
                          <span className="font-semibold text-green-600">
                            {formatPrice(offer?.price ?? 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Vehicle Warning */}
      {vehicleCount === 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <p className="font-medium">Araç Kayıtlı Değil</p>
              <p className="text-sm text-muted-foreground">Talep oluşturmak için önce araç ekleyin</p>
            </div>
            <Link href="/musteri/profil/araclarim">
              <Button size="sm">Araç Ekle</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Talebi İptal Et</AlertDialogTitle>
            <AlertDialogDescription>
              Bu talebi iptal etmek istediğinizden emin misiniz? Bekleyen tüm teklifler reddedilecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "İptal ediliyor..." : "İptal Et"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}