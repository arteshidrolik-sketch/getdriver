"use client";

import { useEffect, useState, useCallback } from "react";
import { requestNotificationPermission, onMessageListener } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface NotificationState {
  permission: NotificationPermission | "unsupported" | "checking";
  token: string | null;
  supported: boolean;
}

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    permission: "checking",
    token: null,
    supported: false,
  });
  const { toast } = useToast();

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      setState(prev => ({ ...prev, permission: "unsupported", supported: false }));
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        const token = await requestNotificationPermission();
        setState({
          permission: "granted",
          token,
          supported: true,
        });
        
        if (token) {
          // Send token to backend
          await fetch("/api/notifications/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, type: "FCM" }),
          });
        }
      } else {
        setState(prev => ({ ...prev, permission: "denied", supported: true }));
      }
    } catch (error) {
      console.error("Notification permission error:", error);
      setState(prev => ({ ...prev, permission: "denied" }));
    }
  }, []);

  // Listen for foreground notifications
  useEffect(() => {
    if (typeof window === "undefined") return;

    const setupListener = async () => {
      const unsubscribe = await onMessageListener((payload) => {
        console.log("FCM foreground message:", payload);
        
        // Show browser notification if permission granted
        if (Notification.permission === "granted") {
          new Notification(payload.notification?.title || "Bildirim", {
            body: payload.notification?.body || "",
            icon: "/icon-192.png",
          });
        }
        
        // Show toast
        toast({
          title: payload.notification?.title || "Bildirim",
          description: payload.notification?.body,
          variant: "default",
        });
      });

      return unsubscribe;
    };

    let cleanup: (() => void) | undefined;
    setupListener().then((fn) => {
      cleanup = fn;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [toast]);

  return {
    ...state,
    requestPermission,
  };
}