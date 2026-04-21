"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface PermissionsState {
  location: boolean;
  camera: boolean;
  notifications: boolean;
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionsState>({
    location: false,
    camera: false,
    notifications: false,
  });
  const [checking, setChecking] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      // Check location permission
      if (navigator.geolocation) {
        const locationPerm = await navigator.permissions.query({ name: "geolocation" });
        setPermissions(prev => ({ ...prev, location: locationPerm.state === "granted" }));
        locationPerm.onchange = () => {
          setPermissions(prev => ({ ...prev, location: locationPerm.state === "granted" }));
        };
      }

      // Check camera permission
      if (navigator.mediaDevices) {
        const cameraPerm = await navigator.permissions.query({ name: "camera" });
        setPermissions(prev => ({ ...prev, camera: cameraPerm.state === "granted" }));
        cameraPerm.onchange = () => {
          setPermissions(prev => ({ ...prev, camera: cameraPerm.state === "granted" }));
        };
      }

      // Check notification permission
      if ("Notification" in window) {
        const notifPerm = Notification.permission;
        setPermissions(prev => ({ ...prev, notifications: notifPerm === "granted" }));
      }
    } catch (error) {
      console.error("Permission check error:", error);
    } finally {
      setChecking(false);
    }
  };

  const requestLocation = async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      toast({
        title: "Hata",
        description: "Tarayıcınız konum özelliğini desteklemiyor",
        variant: "destructive",
      });
      return false;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        });
      });
      
      setPermissions(prev => ({ ...prev, location: true }));
      return true;
    } catch (error: any) {
      if (error.code === 1) {
        toast({
          title: "Konum İzni Gerekli",
          description: "Yolculuk takibi için konum izni vermeniz gerekiyor",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Hata",
          description: "Konum alınamadı",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const requestCamera = async (): Promise<boolean> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        title: "Hata",
        description: "Tarayıcınız kamera özelliğini desteklemiyor",
        variant: "destructive",
      });
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      // Stop the stream immediately, we just needed permission
      stream.getTracks().forEach(track => track.stop());
      setPermissions(prev => ({ ...prev, camera: true }));
      return true;
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        toast({
          title: "Kamera İzni Gerekli",
          description: "Ehliyet ve kimlik fotoğrafı için kamera izni vermeniz gerekiyor",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Hata",
          description: "Kamera kullanılamadı",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const requestNotifications = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      toast({
        title: "Hata",
        description: "Tarayıcınız bildirim özelliğini desteklemiyor",
        variant: "destructive",
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setPermissions(prev => ({ ...prev, notifications: true }));
        return true;
      } else {
        toast({
          title: "Bildirim İzni Gerekli",
          description: "Yeni teklifler ve yolculuk güncellemeleri için bildirim izni verin",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bildirim izni alınamadı",
        variant: "destructive",
      });
      return false;
    }
  };

  const requestAllPermissions = async (): Promise<boolean> => {
    setChecking(true);
    try {
      const [locationResult, cameraResult, notifResult] = await Promise.all([
        requestLocation(),
        requestCamera(),
        requestNotifications(),
      ]);

      const allGranted = locationResult && cameraResult && notifResult;

      if (allGranted) {
        toast({
          title: "Tüm İzinler Verildi",
          description: "Uygulamayı kullanmaya başlayabilirsiniz",
          variant: "success",
        });
      }

      return allGranted;
    } finally {
      setChecking(false);
    }
  };

  return {
    permissions,
    checking,
    requestLocation,
    requestCamera,
    requestNotifications,
    requestAllPermissions,
    checkPermissions,
  };
}
