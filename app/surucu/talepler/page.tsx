"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Clock, Car, Star, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function DriverRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerEta, setOfferEta] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const fetchRequests = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);

    try {
      // Get current location (optional)
      let lat: number | null = null;
      let lng: number | null = null;
      
      if (navigator.geolocation) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              lat = pos.coords.latitude;
              lng = pos.coords.longitude;
              resolve();
            },
            () => resolve(), // Konum alınamazsa devam et
            { timeout: 5000 }
          );
        });
      }

      // Konum varsa filtrele, yoksa tüm talepleri getir
      const url = lat && lng 
        ? `/api/driver/requests?lat=${lat}&lng=${lng}&radius=50`
        : `/api/driver/requests`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.error) {
        console.error("API Error:", data.error);
        toast({
          title: "Hata",
          description: data.error,
          variant: "destructive",
        });
      }
      
      setRequests(data.requests || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(() => fetchRequests(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOffer = async () => {
    if (!selectedRequest || !offerPrice || !offerEta) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/rides/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          price: parseFloat(offerPrice),
          estimatedArrival: parseInt(offerEta),
          message: offerMessage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: "Teklif Gönderildi",
          description: "Teklifiniz müşteriye iletildi",
          variant: "success",
        });
        setSelectedRequest(null);
        setOfferPrice("");
        setOfferEta("");
        setOfferMessage("");
        fetchRequests(false);
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
        description: "Teklif gönderilemedi",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Yakındaki Talepler</h1>
          <p className="text-muted-foreground">15 km yarıçap içindeki talepler</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => fetchRequests(false)}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium">Şu an yakında talep yok</h3>
            <p className="text-sm text-muted-foreground">Yeni talepler geldiğinde burada görünecek</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((request: any) => (
            <Card key={request?.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={request?.customer?.profilePhoto} />
                    <AvatarFallback>{request?.customer?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{request?.customer?.name}</span>
                      {request?.distance && (
                        <Badge variant="outline">
                          {request.distance.toFixed(1)} km uzakta
                        </Badge>
                      )}
                    </div>

                    <div className="mt-2 space-y-1 text-sm">
                      <p className="flex items-center gap-1 text-green-600">
                        <MapPin className="h-3 w-3" />
                        {request?.pickupAddress}
                      </p>
                      <p className="flex items-center gap-1 text-blue-600">
                        <MapPin className="h-3 w-3" />
                        {request?.dropoffAddress}
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2">
                      <Car className="h-3 w-3 inline mr-1" />
                      {request?.vehicle?.brand} {request?.vehicle?.model} - {request?.vehicle?.plate}
                    </p>

                    <div className="mt-3">
                      {request?.alreadyOffered ? (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Teklif verildi
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => setSelectedRequest(request)}
                        >
                          Teklif Ver
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Offer Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Teklif Ver</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p><strong>Müşteri:</strong> {selectedRequest?.customer?.name}</p>
              <p><strong>Araç:</strong> {selectedRequest?.vehicle?.brand} {selectedRequest?.vehicle?.model}</p>
              <p><strong>Alış:</strong> {selectedRequest?.pickupAddress}</p>
              <p><strong>Varış:</strong> {selectedRequest?.dropoffAddress}</p>
            </div>

            <div className="space-y-2">
              <Label>Ücret (TL) *</Label>
              <Input
                type="number"
                placeholder="150"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                min={100}
              />
              <p className="text-xs text-muted-foreground">Minimum 100 TL</p>
            </div>

            <div className="space-y-2">
              <Label>Tahmini Varış Süresi (dk) *</Label>
              <Input
                type="number"
                placeholder="10"
                value={offerEta}
                onChange={(e) => setOfferEta(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Mesaj (Opsiyonel)</Label>
              <Textarea
                placeholder="Müşteriye notunuz..."
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              İptal
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleOffer}
              disabled={submitting || !offerPrice || !offerEta}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Teklif Gönder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}