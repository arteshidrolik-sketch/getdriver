"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Phone, Mail, User, LogOut, Lock, Loader2, Eye, EyeOff, Edit2, Trash2, AlertTriangle, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatPhone } from "@/lib/utils";

interface ProfilePageProps {
  user: any;
}

export function ProfilePage({ user }: ProfilePageProps) {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Hesap silme state'leri
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const { toast } = useToast();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword) {
      toast({ title: "Hata", description: "Mevcut şifrenizi girin", variant: "destructive" });
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
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (data.success) {
        toast({ title: "Başarılı", description: "Şifreniz değiştirildi", variant: "success" });
        setPasswordDialogOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast({ title: "Hata", description: data.error || "Şifre değiştirilemedi", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Hata", description: "Bir hata oluştu", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (deleteConfirmText !== "HESABIMI SİL") {
      toast({ 
        title: "Hata", 
        description: 'Onaylamak için "HESABIMI SİL" yazın', 
        variant: "destructive" 
      });
      return;
    }

    setDeleteLoading(true);
    try {
      const res = await fetch("/api/customer/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          password: deletePassword,
          confirmText: deleteConfirmText 
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({ 
          title: "Hesabınız Silindi", 
          description: "Tüm verileriniz başarıyla silindi. Ana sayfaya yönlendiriliyorsunuz..." 
        });
        setTimeout(() => {
          signOut({ callbackUrl: "/" });
        }, 2000);
      } else {
        toast({ 
          title: "Hata", 
          description: data.error || "Hesap silinemedi", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Hata", 
        description: "Bir hata oluştu", 
        variant: "destructive" 
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.profilePhoto} />
              <AvatarFallback className="text-2xl bg-green-100 text-green-700">
                {user?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{user?.name}</h1>
              <p className="text-sm text-muted-foreground">Müşteri Hesabı</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login Information */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Giriş Bilgileri</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPasswordDialogOpen(true)}
              className="gap-2"
            >
              <Lock className="h-4 w-4" />
              Şifre Değiştir
            </Button>
          </div>
          
          <div className="space-y-4">
            {/* Name */}
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Ad Soyad</p>
                <p className="font-medium">{user?.name || "-"}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Telefon Numarası</p>
                <p className="font-medium">{formatPhone(user?.phone) || "-"}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">E-posta</p>
                <p className="font-medium">{user?.email || "Tanımlanmamış"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        <LogOut className="h-5 w-5 mr-2" />
        Çıkış Yap
      </Button>

      {/* Yasal Belgeler */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">Yasal Belgeler</h3>
          <div className="space-y-2">
            <a href="/kullanim-sartlari" target="_blank" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
              <FileText className="h-4 w-4" /> Kullanım Şartları
            </a>
            <a href="/gizlilik" target="_blank" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
              <Shield className="h-4 w-4" /> Gizlilik Politikası / KVKK
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Section */}
      <Card className="border-red-200 dark:border-red-900">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-700 dark:text-red-400">Hesabı Sil</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinir. Bu işlem geri alınamaz.
              </p>
              <Button
                variant="outline"
                className="mt-4 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hesabımı Sil
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Şifre Değiştir</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label>Mevcut Şifre</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Mevcut şifrenizi girin"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
                  placeholder="Yeni şifrenizi girin"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Yeni Şifre (Tekrar)</Label>
              <Input
                type="password"
                placeholder="Yeni şifrenizi tekrar girin"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                İptal
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Şifreyi Değiştir
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Hesabı Kalıcı Olarak Sil
            </DialogTitle>
            <DialogDescription className="text-left">
              Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz (araçlar, adresler, yolculuk geçmişi, ödeme yöntemleri) kalıcı olarak silinecektir.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-700 dark:text-red-300">
                Onaylamak için aşağıya <strong>"HESABIMI SİL"</strong> yazın:
              </p>
              <Input
                className="mt-2"
                placeholder="HESABIMI SİL"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Şifreniz</Label>
              <Input
                type="password"
                placeholder="Mevcut şifrenizi girin"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDeletePassword("");
                  setDeleteConfirmText("");
                }}
              >
                İptal
              </Button>
              <Button 
                type="submit" 
                className="bg-red-600 hover:bg-red-700" 
                disabled={deleteLoading || deleteConfirmText !== "HESABIMI SİL"}
              >
                {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Hesabımı Sil
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}