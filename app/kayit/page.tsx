"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Shield, Phone, Lock, User, Loader2, Eye, EyeOff, ShieldCheck, MessageSquare, AlertTriangle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 11);
    // Otomatik 0 prefix ekle
    if (value.length > 0 && !value.startsWith("0")) {
      value = "0" + value;
    }
    setPhone(value);
  };

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Hata",
        description: "Ad ve soyad zorunludur",
        variant: "destructive",
      });
      return;
    }

    if (phone.length !== 11) {
      toast({
        title: "Hata",
        description: "Telefon numarası 11 rakam olmalı",
        variant: "destructive",
      });
      return;
    }

    if (!isPasswordValid) {
      toast({
        title: "Hata",
        description: "Şifre gereksinimleri karşılanmıyor",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Hata",
        description: "Şifreler eşleşmiyor",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          firstName,
          lastName,
          password,
          role: "CUSTOMER",
        }),
      });
      const data = await res.json();

      if (data.success) {
        const result = await signIn("credentials", {
          phone,
          password,
          redirect: false,
        });

        if (result?.ok) {
          toast({
            title: "Kayıt Başarılı",
            description: "Hoş geldiniz!",
            variant: "success",
          });
          router.replace("/musteri");
        } else {
          router.push("/giris");
        }
      } else {
        toast({
          title: "Hata",
          description: data.error || "Kayıt başarısız",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error?.message || "Bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-10 w-10 text-green-600" />
            <span className="text-2xl font-bold text-green-700 dark:text-green-500">GetDriver</span>
          </Link>
          <CardTitle className="text-2xl">Müşteri Kayıt</CardTitle>
          <CardDescription>Hesabınızı oluşturun</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Security Notice */}
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold">
                <ShieldCheck className="h-5 w-5" />
                <span>Güvenliğiniz Bizim İçin Önemli</span>
              </div>
              <div className="text-sm text-green-600 dark:text-green-500 space-y-2">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Tüm iletişim uygulama içinden yapılır, telefon numaranız gizli tutulur.</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Platform dışı anlaşmalarda sorumluluk kabul edilmez.</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon Numarası</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="05XXXXXXXXX"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">11 rakam girin</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Ad</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Ad"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Soyad</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Soyad"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Güçlü bir şifre oluşturun"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="text-xs space-y-1 mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <div className={`flex items-center gap-1 ${passwordChecks.length ? "text-green-600" : "text-red-500"}`}>
                    {passwordChecks.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    <span>En az 8 karakter</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordChecks.uppercase ? "text-green-600" : "text-red-500"}`}>
                    {passwordChecks.uppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    <span>En az bir büyük harf (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordChecks.lowercase ? "text-green-600" : "text-red-500"}`}>
                    {passwordChecks.lowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    <span>En az bir küçük harf (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordChecks.number ? "text-green-600" : "text-red-500"}`}>
                    {passwordChecks.number ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    <span>En az bir rakam (0-9)</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Şifreyi tekrar girin"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <X className="h-3 w-3" /> Şifreler eşleşmiyor
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading || !isPasswordValid || password !== confirmPassword || !firstName.trim() || !lastName.trim() || phone.length !== 11}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Kayıt Ol"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Zaten hesabınız var mı?{" "}
              <Link href="/giris" className="text-green-600 hover:underline font-medium">
                Giriş Yap
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
