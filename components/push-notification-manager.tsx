"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  const { data: session } = useSession() || {};
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  useEffect(() => {
    if (isSupported && session?.user && !isSubscribed) {
      // Check if user has already dismissed the banner
      const dismissed = localStorage.getItem('push-banner-dismissed');
      if (!dismissed) {
        // Show banner after a short delay
        const timer = setTimeout(() => setShowBanner(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isSupported, session, isSubscribed]);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const subscribe = async () => {
    setLoading(true);
    try {
      // Check VAPID key
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        toast({
          title: "Yapılandırma Hatası",
          description: "Push bildirimleri henüz yapılandırılmamış.",
          variant: "destructive",
        });
        setShowBanner(false);
        return;
      }

      // Register service worker
      let registration;
      try {
        registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;
      } catch (swError) {
        console.error('Service Worker error:', swError);
        toast({
          title: "Service Worker Hatası",
          description: "Bildirim servisi yüklenemedi. Sayfayı yenileyin.",
          variant: "destructive",
        });
        setShowBanner(false);
        return;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast({
          title: "Bildirim izni reddedildi",
          description: "Tarayıcı ayarlarından bildirimlere izin vermeniz gerekiyor.",
          variant: "destructive",
        });
        setShowBanner(false);
        return;
      }

      // Subscribe to push
      let subscription;
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      } catch (subError: any) {
        console.error('Push subscribe error:', subError);
        toast({
          title: "Abonelik Hatası",
          description: subError.message || "Push aboneliği oluşturulamadı.",
          variant: "destructive",
        });
        setShowBanner(false);
        return;
      }

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      if (response.ok) {
        setIsSubscribed(true);
        setShowBanner(false);
        toast({
          title: "Bildirimler aktif!",
          description: "Yeni teklifler geldiğinde bildirim alacaksınız.",
        });
      } else {
        const data = await response.json();
        toast({
          title: "Sunucu Hatası",
          description: data.error || "Bildirim kaydı başarısız oldu.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Push subscription error:', error);
      toast({
        title: "Hata",
        description: error.message || "Beklenmeyen bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('push-banner-dismissed', 'true');
  };

  if (!isSupported || !session?.user || !showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-5">
      <button
        onClick={dismissBanner}
        className="absolute top-2 right-2 p-1 hover:bg-green-700 rounded"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3">
        <Bell className="h-6 w-6 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Bildirimleri Aç</h3>
          <p className="text-sm text-green-100 mb-3">
            Yeni sürücü teklifleri geldiğinde anında haberdar olun.
          </p>
          <Button
            onClick={subscribe}
            disabled={loading}
            size="sm"
            variant="secondary"
            className="w-full"
          >
            {loading ? "Aktifleştiriliyor..." : "Bildirimleri Aç"}
          </Button>
        </div>
      </div>
    </div>
  );
}
