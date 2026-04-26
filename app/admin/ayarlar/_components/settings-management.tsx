"use client";

import { useState } from "react";
import { Settings, Percent, Bell, Shield, Database, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export function SettingsManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Platform settings
  const [commissionRate, setCommissionRate] = useState("20");
  const [minPrice, setMinPrice] = useState("50");
  const [maxPrice, setMaxPrice] = useState("5000");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: API call to save settings
      toast({
        title: "Ayarlar Kaydedildi",
        description: "Platform ayarları güncellendi",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Ayarlar kaydedilemedi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ayarlar</h1>
          <p className="text-muted-foreground">Platform ayarlarını yönet</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-green-600">
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>

      {/* Platform Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Platform Ayarları
          </CardTitle>
          <CardDescription>Komisyon ve fiyat aralıkları</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commission">Komisyon Oranı (%)</Label>
              <Input
                id="commission"
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                min="0"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minPrice">Minimum Ücret (TL)</Label>
              <Input
                id="minPrice"
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPrice">Maximum Ücret (TL)</Label>
              <Input
                id="maxPrice"
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Bildirim Ayarları
          </CardTitle>
          <CardDescription>E-posta ve SMS bildirimleri</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">E-posta Bildirimleri</p>
              <p className="text-sm text-muted-foreground">Yeni sürücü başvuruları ve ödemeler</p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">SMS Bildirimleri</p>
              <p className="text-sm text-muted-foreground"> Kritik uyarılar için SMS</p>
            </div>
            <Switch
              checked={smsNotifications}
              onCheckedChange={setSmsNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Güvenlik Ayarları
          </CardTitle>
          <CardDescription>Şifre ve güvenlik politikaları</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">İki Faktörlü Doğrulama</p>
              <p className="text-sm text-muted-foreground">Admin hesapları için 2FA zorunlu</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Oturum Zaman Aşımı</p>
              <p className="text-sm text-muted-foreground">30 dakika hareketsizlik sonrası çıkış</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Database Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Sistem Bilgisi
          </CardTitle>
          <CardDescription>Versiyon ve bağlantı bilgileri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-muted-foreground">Database</p>
              <p className="font-mono">Neon PostgreSQL</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-muted-foreground">Hosting</p>
              <p className="font-mono">Vercel</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-muted-foreground">Versiyon</p>
              <p className="font-mono">1.0.0</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-muted-foreground">Son Deploy</p>
              <p className="font-mono">{new Date().toLocaleDateString("tr")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}