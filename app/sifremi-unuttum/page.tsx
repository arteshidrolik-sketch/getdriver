"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Phone, Lock, Loader2, Eye, EyeOff, ArrowLeft, KeyRound, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Telefon numarasını formatla
function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
}

// Şifre validasyonu
function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: "Şifre en az 8 karakter olmalı" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Şifre en az bir büyük harf içermeli" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Şifre en az bir küçük harf içermeli" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Şifre en az bir rakam içermeli" };
  }
  return { valid: true };
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"phone" | "code" | "password" | "success">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  // Telefon numarası gönder - SMS kodu iste
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanedPhone = phone.replace(/\D/g, "");
      
      if (cleanedPhone.length !== 10) {
        toast({
          title: "Hata",
          description: "Geçerli bir telefon numarası girin",
          variant: "destructive",
        });
        return;
      }

      const res = await fetch("/api/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanedPhone }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Kod Gönderildi",
          description: "Telefonunuza doğrulama kodu gönderildi",
        });
        setStep("code");
        setCountdown(120); // 2 dakika geri sayım
        
        // Geri sayım başlat
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast({
          title: "Hata",
          description: data.error || "Kod gönderilemedi",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Kod doğrula
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      toast({
        title: "Hata",
        description: "6 haneli kodu girin",
        variant: "destructive",
      });
      return;
    }

    setStep("password");
  };

  // Yeni şifre kaydet
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Şifre validasyonu
      const validation = validatePassword(password);
      if (!validation.valid) {
        toast({
          title: "Hata",
          description: validation.error,
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

      const cleanedPhone = phone.replace(/\D/g, "");
      
      const res = await fetch("/api/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanedPhone,
          code,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Başarılı",
          description: "Şifreniz güncellendi",
        });
        setStep("success");
      } else {
        toast({
          title: "Hata",
          description: data.error || "Şifre güncellenemedi",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Tekrar kod gönder
  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      const cleanedPhone = phone.replace(/\D/g, "");
      
      const res = await fetch("/api/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanedPhone }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Kod Gönderildi",
          description: "Yeni doğrulama kodu gönderildi",
        });
        setCountdown(120);
      } else {
        toast({
          title: "Hata",
          description: data.error || "Kod gönderilemedi",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Geri sayım formatı
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-10 w-10 text-green-600" />
            <span className="text-2xl font-bold text-green-700 dark:text-green-500">GetDriver</span>
          </Link>
          <CardTitle className="text-2xl">
            {step === "phone" && "Şifremi Unuttum"}
            {step === "code" && "Doğrulama Kodu"}
            {step === "password" && "Yeni Şifre"}
            {step === "success" && "Başarılı!"}
          </CardTitle>
          <CardDescription>
            {step === "phone" && "Telefon numaranızı girin"}
            {step === "code" && `Kodu ${formatPhone(phone)} numarasına gönderdik`}
            {step === "password" && "Yeni şifrenizi belirleyin"}
            {step === "success" && "Şifreniz güncellendi"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Telefon Adımı */}
          {step === "phone" && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon Numarası</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="5XX XXX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  "Kod Gönder"
                )}
              </Button>
            </form>
          )}

          {/* Kod Doğrulama Adımı */}
          {step === "code" && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Doğrulama Kodu</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="code"
                    type="text"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="pl-10 text-center text-2xl tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Doğrula
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={countdown > 0 || loading}
                  className="text-sm text-green-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                >
                  {countdown > 0 
                    ? `Tekrar gönder (${formatCountdown(countdown)})` 
                    : "Kodu tekrar gönder"}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Telefon numarasını değiştir
                </button>
              </div>
            </form>
          )}

          {/* Yeni Şifre Adımı */}
          {step === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Yeni Şifre</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  En az 8 karakter, 1 büyük harf, 1 küçük harf, 1 rakam
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Güncelleniyor...
                  </>
                ) : (
                  "Şifremi Güncelle"
                )}
              </Button>
            </form>
          )}

          {/* Başarı Adımı */}
          {step === "success" && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              <p className="text-muted-foreground">
                Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.
              </p>
              <Link href="/giris">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Giriş Yap
                </Button>
              </Link>
            </div>
          )}

          {/* Geri Linki */}
          {step !== "success" && (
            <div className="mt-6 text-center">
              <Link 
                href="/giris" 
                className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Giriş sayfasına dön
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
