"use client";

import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";
import { useToast } from "@/hooks/use-toast";

export function NotificationBell() {
  const { permission, supported, requestPermission } = useNotifications();
  const { toast } = useToast();

  if (!supported || permission === "unsupported") {
    return null;
  }

  if (permission === "granted") {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5 text-green-600" />
        <span className="absolute top-1 right-1 h-2 w-2 bg-green-500 rounded-full" />
      </Button>
    );
  }

  if (permission === "checking") {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    );
  }

  // Permission denied or default - show button to enable
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => {
        requestPermission();
        toast({
          title: "Bildirimler",
          description: "Bildirim izni istenecek",
        });
      }}
      className="relative"
    >
      <BellOff className="h-5 w-5 text-muted-foreground" />
    </Button>
  );
}