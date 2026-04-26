"use client";

import { useEffect } from "react";
import { useNotifications } from "@/hooks/use-notifications";

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { permission, requestPermission } = useNotifications();

  useEffect(() => {
    // Auto-request permission on mount if not decided
    if (permission === "default") {
      requestPermission();
    }
  }, []);

  return <>{children}</>;
}