"use client";

import { useState, useEffect, useCallback } from "react";

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

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      // Check location permission
      if (navigator.geolocation) {
        try {
          const locationPerm = await navigator.permissions.query({ name: "geolocation" });
          setPermissions(prev => ({ ...prev, location: locationPerm.state === "granted" }));
          locationPerm.onchange = () => {
            setPermissions(prev => ({ ...prev, location: locationPerm.state === "granted" }));
          };
        } catch (e) {
          console.log("Location permission check failed");
        }
      }

      // Check camera permission
      if (navigator.mediaDevices) {
        try {
          const cameraPerm = await navigator.permissions.query({ name: "camera" });
          setPermissions(prev => ({ ...prev, camera: cameraPerm.state === "granted" }));
          cameraPerm.onchange = () => {
            setPermissions(prev => ({ ...prev, camera: cameraPerm.state === "granted" }));
          };
        } catch (e) {
          console.log("Camera permission check failed");
        }
      }

      // Check notification permission
      if ("Notification" in window) {
        setPermissions(prev => ({ ...prev, notifications: Notification.permission === "granted" }));
      }
    } catch (error) {
      console.error("Permission check error:", error);
    } finally {
      setChecking(false);
    }
  };

  const requestLocation = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
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
    } catch (error) {
      console.log("Location permission denied");
      return false;
    }
  }, []);

  const requestCamera = useCallback(async (): Promise<boolean> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      stream.getTracks().forEach(track => track.stop());
      setPermissions(prev => ({ ...prev, camera: true }));
      return true;
    } catch (error) {
      console.log("Camera permission denied");
      return false;
    }
  }, []);

  const requestNotifications = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setPermissions(prev => ({ ...prev, notifications: true }));
        return true;
      }
      return false;
    } catch (error) {
      console.log("Notification permission denied");
      return false;
    }
  }, []);

  const requestAllPermissions = useCallback(async (): Promise<boolean> => {
    setChecking(true);
    try {
      const [locationResult, cameraResult, notifResult] = await Promise.all([
        requestLocation(),
        requestCamera(),
        requestNotifications(),
      ]);

      return locationResult && cameraResult && notifResult;
    } finally {
      setChecking(false);
    }
  }, [requestLocation, requestCamera, requestNotifications]);

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
