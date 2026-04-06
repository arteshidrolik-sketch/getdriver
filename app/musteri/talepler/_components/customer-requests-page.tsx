"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Clock, Car, Star, ChevronRight, Inbox, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { formatPrice, formatDate, getStatusText, getStatusColor } from "@/lib/utils";

interface CustomerRequestsPageProps {
  requests: any[];
}

export function CustomerRequestsPage({ requests }: CustomerRequestsPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingRequestId, setDeletingRequestId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeRequests = requests.filter(r => r.status === "ACTIVE" || r.status === "ACCEPTED");
  const pastRequests = requests.filter(r => r.status !== "ACTIVE" && r.status !== "ACCEPTED");

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
    <div className="p-4 max-w-4xl mx-auto space-y-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Taleplerim</h1>
        <Link href="/musteri/yeni-talep">
          <Button className="bg-green-600 hover:bg-green-700">Yeni Talep</Button>
        </Link>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="relative">
            Aktif
            {activeRequests.length > 0 && (
              <Badge className="ml-2 bg-green-600">{activeRequests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">Geçmiş</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-4">
          {activeRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aktif talebiniz bulunmuyor</p>
                <Link href="/musteri/yeni-talep">
                  <Button className="mt-4 bg-green-600 hover:bg-green-700">Yeni Talep Oluştur</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            activeRequests.map((request) => (
              <RequestCard 
                key={request.id} 
                request={request} 
                canCancel={canCancelRequest(request)}
                onCancelClick={handleDeleteClick}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-4">
          {pastRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Geçmiş talebiniz bulunmuyor</p>
              </CardContent>
            </Card>
          ) : (
            pastRequests.map((request) => (
              <RequestCard 
                key={request.id} 
                request={request} 
                canCancel={false}
                onCancelClick={handleDeleteClick}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

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

interface RequestCardProps {
  request: any;
  canCancel: boolean;
  onCancelClick: (e: React.MouseEvent, requestId: string) => void;
}

function RequestCard({ request, canCancel, onCancelClick }: RequestCardProps) {
  const offerCount = request.offers?.length || 0;

  return (
    <Link href={`/musteri/talep/${request.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              {/* Addresses */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm line-clamp-1">{request.pickupAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-sm line-clamp-1">{request.dropoffAddress}</span>
                </div>
              </div>

              {/* Vehicle */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Car className="h-3 w-3" />
                <span>{request.vehicle?.brand} {request.vehicle?.model} - {request.vehicle?.plate}</span>
              </div>

              {/* Status & Date */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getStatusColor(request.status)}>
                  {getStatusText(request.status)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(request.createdAt)}
                </span>
              </div>
            </div>

            {/* Right side - Offers & Actions */}
            <div className="flex flex-col items-end gap-2">
              {offerCount > 0 ? (
                <Badge variant="info" className="whitespace-nowrap">
                  {offerCount} teklif
                </Badge>
              ) : request.status === "ACTIVE" ? (
                <Badge variant="secondary">Teklif bekleniyor</Badge>
              ) : null}
              
              <div className="flex items-center gap-2">
                {canCancel && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => onCancelClick(e, request.id)}
                    title="Talebi İptal Et"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Offers preview */}
          {offerCount > 0 && request.status === "ACTIVE" && (
            <div className="mt-3 pt-3 border-t space-y-2">
              {request.offers.slice(0, 2).map((offer: any) => (
                <div key={offer.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={offer.driver?.user?.profilePhoto} />
                      <AvatarFallback>{offer.driver?.user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{offer.driver?.user?.name}</span>
                    <span className="flex items-center text-amber-500">
                      <Star className="h-3 w-3 mr-0.5 fill-current" />
                      {(offer.driver?.ratingAvg || 0).toFixed(1)}
                    </span>
                  </div>
                  <span className="font-semibold text-green-600">
                    {formatPrice(offer.price)}
                  </span>
                </div>
              ))}
              {offerCount > 2 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{offerCount - 2} teklif daha
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
