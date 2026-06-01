"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User, Phone, Mail, Lock, Loader2, Eye, EyeOff, Star, Car, Shield, Banknote, CreditCard, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { signOut } from "next-auth/react";
import { formatPrice } from "@/lib/utils";

interface DriverProfilePageProps {
  user: any;
}

export function DriverProfilePage({ user }: DriverProfilePageProps) {
  const { toast } = useToast();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // IBAN state
  const [ibanDialogOpen, setIbanDialogOpen] = useState(false);
  const [iban, setIban] = useState("");
  const [ibanHolderName, setIbanHolderName] = useState("");
  const [ibanLoading, setIbanLoading] = useState(false);
  const [ibanInfo, setIbanInfo] = useState<any>(null);

  const driver = user.driver;

  // Fetch IBAN info on mount
  useEffect(() => {
    fetchIbanInfo();
  }, []);

  const fetchIbanInfo = async () => {
    try {
      const res = await fetch("/api/driver/iban");
      if (res.ok) {
        const data = await res.json();
        setIbanInfo(data);
        if (data.iban) setIban(data.iban);
        if (data.ibanHolderName) setIbanHolderName(data.ibanHolderName);
      }
    } catch (error) {
      console.error("Error fetching IBAN:", error);
    }
  };

  const formatIban = (value: string) => {
    const cleaned = value.replace(/\s/g, "").toUpperCase();
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(" ") : cleaned;
  };

  const handleIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, "").toUpperCase();
    if (value.length <= 26) {
      setIban(value);
    }
  };

  const handleIbanSave = async () => {
    if (!iban || !ibanHolderName) {
      toast({ title: "Hata", description: "Tüm alanları doldurun", variant: "destructive" });
      return;
    }

    setIbanLoading(true);
    try {
      const res = await fetch("/api/driver/iban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ iban, ibanHolderName })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bir hata oluştu");

      toast({ title: "Başarılı", description: "IBAN bilgileri kaydedildi" });
      setIbanDialogOpen(false);
      fetchIbanInfo();
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } finally {
      setIbanLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "Hata", description: "Tüm alanları doldurun", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Hata", description: "Yeni şifre en az 8 karakter olmalı", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Hata", description: "Yeni şifreler eşleşmiyor", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/customer/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bir hata oluştu");

      toast({ title: "Başarılı", description: "Şifreniz güncellendi" });
      setPasswordDialogOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (driver?.approvalStatus) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-700">Onaylandı</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-700">Onay Bekliyor</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-700">Reddedildi</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profilim</h1>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.profilePhoto || undefined} />
              <AvatarFallback className="text-2xl">
                {user.name?.charAt(0) || "S"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge()}
              </div>
              {driver && (
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{driver.ratingAvg?.toFixed(1) || "0.0"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Car className="h-4 w-4" />
                    <span>{driver.totalRides} sürüş</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Giriş Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Ad Soyad</p>
              <p className="font-medium">{user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Telefon</p>
              <p className="font-medium">{user.phone}</p>
            </div>
          </div>
          {user.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">E-posta</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
          )}

          <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full mt-4">
                <Lock className="h-4 w-4 mr-2" />
                Şifre Değiştir
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Şifre Değiştir</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Mevcut Şifre</Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Mevcut şifrenizi girin"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Yeni Şifre</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Yeni şifrenizi girin"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Yeni Şifre (Tekrar)</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Yeni şifrenizi tekrar girin"
                  />
                </div>
                <Button onClick={handlePasswordChange} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Şifreyi Güncelle
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Payment Info / IBAN */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Ödeme Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ibanInfo ? (
            <>
              {/* Earnings Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Bekleyen Ödeme</p>
                  <p className="text-xl font-bold text-green-600">{formatPrice(ibanInfo.pendingPayout || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Toplam Kazanç</p>
                  <p className="text-xl font-bold">{formatPrice(ibanInfo.totalEarnings || 0)}</p>
                </div>
              </div>

              {ibanInfo.lastPayoutDate && (
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="text-gray-500">Son Ödeme</p>
                  <p className="font-medium">
                    {formatPrice(ibanInfo.lastPayoutAmount || 0)} - {new Date(ibanInfo.lastPayoutDate).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              )}

              {/* IBAN Status */}
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">IBAN</p>
                  {ibanInfo.iban ? (
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm">{formatIban(ibanInfo.iban)}</p>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">IBAN girilmedi</span>
                    </div>
                  )}
                  {ibanInfo.ibanHolderName && (
                    <p className="text-xs text-gray-400 mt-1">{ibanInfo.ibanHolderName}</p>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500">
                💡 Kazançlarınız haftalık olarak IBAN hesabınıza aktarılır. IBAN bilgilerinizi güncel tutun.
              </p>
            </>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          )}

          <Dialog open={ibanDialogOpen} onOpenChange={setIbanDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                {ibanInfo?.iban ? "IBAN Güncelle" : "IBAN Ekle"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>IBAN Bilgileri</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>IBAN</Label>
                  <Input
                    value={formatIban(iban)}
                    onChange={handleIbanChange}
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500">TR ile başlayan 26 karakterli IBAN numaranız</p>
                </div>
                <div className="space-y-2">
                  <Label>Hesap Sahibi Adı</Label>
                  <Input
                    value={ibanHolderName}
                    onChange={(e) => setIbanHolderName(e.target.value.toUpperCase())}
                    placeholder="AD SOYAD"
                    className="uppercase"
                  />
                  <p className="text-xs text-gray-500">Banka hesabının sahibinin tam adı</p>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                  <strong>Önemli:</strong> IBAN ve hesap sahibi bilgilerinin doğru olduğundan emin olun. Yanlış bilgi girişi ödemelerin gecikmesine neden olabilir.
                </div>
                <Button onClick={handleIbanSave} disabled={ibanLoading} className="w-full bg-green-600 hover:bg-green-700">
                  {ibanLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Kaydet
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Yasal Belgeler */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">Yasal Belgeler</h3>
          <div className="space-y-2">
            <a href="/surucu-sozlesmesi" target="_blank" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
              <FileText className="h-4 w-4" /> Sürücü Sözleşmesi
            </a>
            <a href="/kullanim-sartlari" target="_blank" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
              <FileText className="h-4 w-4" /> Kullanım Şartları
            </a>
            <a href="/gizlilik" target="_blank" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
              <Shield className="h-4 w-4" /> Gizlilik Politikası / KVKK
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Logout Button */}
      <Button
        variant="outline"
        className="w-full text-red-600 border-red-200 hover:bg-red-50"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Çıkış Yap
      </Button>
    </div>
  );
}
