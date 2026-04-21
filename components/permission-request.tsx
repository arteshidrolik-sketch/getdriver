"use client";

import { useState } from "react";
import { MapPin, Camera, Bell, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermissions, PermissionsState } from "@/hooks/use-permissions";

interface PermissionRequestProps {
  onComplete?: (allGranted: boolean) => void;
  showSkip?: boolean;
}

export function PermissionRequest({ onComplete, showSkip = false }: PermissionRequestProps) {
  const {
    permissions,
    checking,
    requestLocation,
    requestCamera,
    requestNotifications,
    requestAllPermissions,
  } = usePermissions();

  const [loading, setLoading] = useState(false);
  const [showDenied, setShowDenied] = useState(false);

  const allGranted = permissions.location && permissions.camera && permissions.notifications;

  const handleRequestAll = async () => {
    setLoading(true);
    await requestAllPermissions();
    setLoading(false);
    setShowDenied(true);
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete(allGranted);
    }
  };

  if (checking) {
    return (
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-6 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-green-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">İzinler kontrol ediliyor...</p>
        </CardContent>
      </Card>
    );
  }

  if (allGranted) {
    return null; // All permissions already granted
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">İzinler Gerekli</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          GetDriver'ı kullanmak için aşağıdaki izinleri vermeniz gerekiyor.
        </p>

        {/* Location Permission */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
          <div className={`p-2 rounded-full ${permissions.location ? "bg-green-100" : "bg-gray-200"}`}>
            {permissions.location ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <MapPin className="h-5 w-5 text-gray-500" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Konum</p>
            <p className="text-xs text-muted-foreground">
              {permissions.location
                ? "Konum izni verildi"
                : "Yolculuk takibi ve sürücü bulma için gerekli"}
            </p>
          </div>
          {!permissions.location && (
            <Button size="sm" variant="outline" onClick={requestLocation}>
              İzin Ver
            </Button>
          )}
        </div>

        {/* Camera Permission */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
          <div className={`p-2 rounded-full ${permissions.camera ? "bg-green-100" : "bg-gray-200"}`}>
            {permissions.camera ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <Camera className="h-5 w-5 text-gray-500" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Kamera</p>
            <p className="text-xs text-muted-foreground">
              {permissions.camera
                ? "Kamera izni verildi"
                : "Ehliyet ve kimlik fotoğrafı için gerekli"}
            </p>
          </div>
          {!permissions.camera && (
            <Button size="sm" variant="outline" onClick={requestCamera}>
              İzin Ver
            </Button>
          )}
        </div>

        {/* Notification Permission */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
          <div className={`p-2 rounded-full ${permissions.notifications ? "bg-green-100" : "bg-gray-200"}`}>
            {permissions.notifications ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <Bell className="h-5 w-5 text-gray-500" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Bildirimler</p>
            <p className="text-xs text-muted-foreground">
              {permissions.notifications
                ? "Bildirim izni verildi"
                : "Yeni teklifler için gerekli"}
            </p>
          </div>
          {!permissions.notifications && (
            <Button size="sm" variant="outline" onClick={requestNotifications}>
              İzin Ver
            </Button>
          )}
        </div>

        {/* Status Message */}
        {showDenied && !allGranted && (
          <div className="text-center text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            Bazı izinler reddedildi. İzin vermezseniz uygulama bazı özellikleri kullanamaz.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {!allGranted && (
            <Button
              onClick={handleRequestAll}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? "İzinler veriliyor..." : "Tüm İzinleri Ver"}
            </Button>
          )}
          
          {(allGranted || showSkip) && (
            <Button
              onClick={handleComplete}
              variant={allGranted ? "outline" : "default"}
              className={allGranted ? "flex-1" : "flex-1 bg-green-600 hover:bg-green-700"}
            >
              {allGranted ? "Devam Et" : "İzin Vermeden Devam Et"}
            </Button>
          )}
        </div>

        {!allGranted && !showSkip && (
          <Button
            onClick={handleComplete}
            variant="ghost"
            className="w-full text-sm text-muted-foreground"
          >
            İzin Vermeden Devam Et
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
