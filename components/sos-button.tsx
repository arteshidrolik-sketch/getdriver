"use client";

import { useState } from "react";
import { Phone, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function SOSButton() {
  const [open, setOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const startSOS = () => {
    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          // Call emergency
          window.location.href = "tel:112";
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSOS = () => {
    setCountdown(null);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="destructive"
        size="lg"
        className="fixed bottom-20 right-4 z-50 rounded-full h-14 w-14 shadow-lg animate-pulse"
        onClick={() => setOpen(true)}
      >
        <AlertTriangle className="h-6 w-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Acil Durum
            </DialogTitle>
            <DialogDescription>
              Acil durumda yardım çağırmak için aşağıdaki seçenekleri kullanın.
            </DialogDescription>
          </DialogHeader>

          {countdown !== null ? (
            <div className="text-center py-8">
              <div className="text-6xl font-bold text-red-600 mb-4">{countdown}</div>
              <p className="text-muted-foreground mb-4">112 aranıyor...</p>
              <Button variant="outline" onClick={cancelSOS}>
                <X className="h-4 w-4 mr-2" />
                İptal
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <a href="tel:112" className="block">
                <Button variant="destructive" className="w-full h-14 text-lg">
                  <Phone className="h-5 w-5 mr-2" />
                  112 - Acil Yardım
                </Button>
              </a>
              <a href="tel:155" className="block">
                <Button variant="outline" className="w-full h-12 border-red-200 text-red-700 hover:bg-red-50">
                  <Phone className="h-4 w-4 mr-2" />
                  155 - Polis İmdat
                </Button>
              </a>
              <Button
                variant="secondary"
                className="w-full"
                onClick={startSOS}
              >
                5 Saniye Sonra Otomatik Ara
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}