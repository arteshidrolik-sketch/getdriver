"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, CreditCard, CheckCircle, AlertTriangle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function OdemePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const rideId = searchParams.get("rideId");
  
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [ride, setRide] = useState<any>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  // Yolculuk bilgilerini getir
  useEffect(() => {
    if (!rideId) {
      router.push("/musteri");
      return;
    }

    const fetchRide = async () => {
      try {
        const res = await fetch(`/api/rides/${rideId}`);
        if (res.ok) {
          const data = await res.json();
          setRide(data.ride);
          
          // Eğer ödeme zaten tamamlandıysa yönlendir
          if (data.ride.payment?.status === "COMPLETED") {
            toast({
              title: "Ödeme Tamamlandı",
              description: "Bu yolculuk için ödeme zaten yapılmış.",
            });
            router.push(`/musteri/yolculuk/${rideId}`);
            return;
          }
        } else {
          toast({
            title: "Hata",
            description: "Yolculuk bilgileri alınamadı",
            variant: "destructive",
          });
          router.push("/musteri");
        }
      } catch (error) {
        console.error("Ride fetch error:", error);
        toast({
          title: "Hata",
          description: "Bir hata oluştu",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRide();
  }, [rideId, router, toast]);

  // PayTR token al ve iframe göster
  const initiatePayment = async () => {
    if (!rideId) return;
    
    setPaymentLoading(true);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rideId,
          email: ride?.request?.customer?.email,
          name: ride?.request?.customer?.name,
        }),
      });

      const data = await res.json();

      if (res.ok && data.iframeUrl) {
        setIframeUrl(data.iframeUrl);
      } else {
        toast({
          title: "Ödeme Başlatılamadı",
          description: data.error || "Bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Payment init error:", error);
      toast({
        title: "Hata",
        description: "Ödeme başlatılırken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Yolculuk bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href={`/musteri/yolculuk/${rideId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Ödeme</h1>
              <p className="text-sm text-gray-500">Yolculuk #{ride.id.slice(-6).toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {!iframeUrl ? (
          <>
            {/* Özet Kartı */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Yolculuk Özeti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                  <div>
                    <p className="text-sm text-gray-500">Alış</p>
                    <p className="font-medium">{ride.request.pickupAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />
                  <div>
                    <p className="text-sm text-gray-500">Bırakış</p>
                    <p className="font-medium">{ride.request.dropoffAddress}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Sürücü</span>
                    <span className="font-medium">{ride.driver?.user?.name}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-600">Araç</span>
                    <span className="font-medium">
                      {ride.request.vehicle.brand} {ride.request.vehicle.model}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Toplam Tutar</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(ride.price)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Güvenlik Bilgisi */}
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">Güvenli Ödeme</p>
                    <p className="text-sm text-blue-600">
                      Ödemeniz PayTR altyapısı ile 256-bit SSL şifreleme ile korunmaktadır. 
                      Kart bilgileriniz sunucularımızda saklanmaz.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ödeme Butonu */}
            <Button
              onClick={initiatePayment}
              disabled={paymentLoading}
              className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
            >
              {paymentLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Hazırlanıyor...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  {formatPrice(ride.price)} Öde
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            {/* PayTR iFrame */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Kredi/Banka Kartı ile Öde
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <iframe
                  src={iframeUrl}
                  frameBorder="0"
                  scrolling="no"
                  style={{ width: "100%", height: "600px" }}
                  allow="payment"
                />
              </CardContent>
            </Card>

            {/* Bilgi */}
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Ödeme Ekranı</p>
                    <p className="text-sm text-amber-600">
                      Ödeme tamamlandığında otomatik olarak yönlendirileceksiniz. 
                      Lütfen pencereyi kapatmayın.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
