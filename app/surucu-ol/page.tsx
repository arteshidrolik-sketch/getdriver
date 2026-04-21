"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Shield, Phone, Lock, User, Loader2, Eye, EyeOff, CheckCircle2, Upload, FileText, AlertTriangle, ShieldCheck, MessageSquare, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PermissionRequest } from "@/components/permission-request";

export default function DriverRegisterPage() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [licensePhoto, setLicensePhoto] = useState<File | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [criminalRecordPhoto, setCriminalRecordPhoto] = useState<File | null>(null);
  const [criminalDeclare, setCriminalDeclare] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [registered, setRegistered] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Şifre validasyonu
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const goToStep2 = () => {
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      toast({
        title: "Hata",
        description: "Geçerli bir telefon numarası girin",
        variant: "destructive",
      });
      return;
    }
    if (!name.trim()) {
      toast({
        title: "Hata",
        description: "Ad soyad zorunludur",
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
    setStep(2);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const presignedRes = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          isPublic: false,
        }),
      });
      const { uploadUrl, cloud_storage_path } = await presignedRes.json();

      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      return cloud_storage_path;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!licensePhoto) {
      toast({
        title: "Hata",
        description: "Ehliyet fotoğrafı zorunludur",
        variant: "destructive",
      });
      return;
    }

    if (!criminalRecordPhoto) {
      toast({
        title: "Hata",
        description: "Adli sicil kaydı belgesi zorunludur",
        variant: "destructive",
      });
      return;
    }

    if (!criminalDeclare) {
      toast({
        title: "Hata",
        description: "Adli sicil beyanını onaylamanız gerekiyor",
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
          phone: phone.replace(/\D/g, ""),
          name,
          password,
          role: "DRIVER",
        }),
      });
      const data = await res.json();

      if (data.success) {
        // Eğer mevcut kullanıcıysa, direkt giriş yap
        // Yeni kullanıcıysa, signup sonrası otomatik giriş yapılacak
        const loginResult = await signIn("credentials", {
          phone: phone.replace(/\D/g, ""),
          password,
          redirect: false,
        });

        if (loginResult?.ok) {
          const licenseUrl = await uploadFile(licensePhoto);
          const profileUrl = profilePhoto ? await uploadFile(profilePhoto) : null;
          const criminalRecordUrl = await uploadFile(criminalRecordPhoto);

          await fetch("/api/driver/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              licensePhoto: licenseUrl,
              profilePhoto: profileUrl,
              criminalRecordPhoto: criminalRecordUrl,
              criminalRecordDecl: criminalDeclare,
            }),
          });

          toast({
            title: "Başvuru Alındı",
            description: data.isExistingUser 
              ? "Mevcut hesabınıza sürücü başvurusu eklendi. Onay sonrası bilgilendirileceksiniz."
              : "Sürücü başvurunuz incelemeye alındı. Onay sonrası bilgilendirileceksiniz.",
            variant: "success",
          });
          
          setRegistered(true);
          setShowPermissions(true);
        }
      } else {
        toast({
          title: "Hata",
          description: data.error || "Kayıt başarısız",
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

  // Show permission request after successful registration
  if (showPermissions && registered) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
        <PermissionRequest onComplete={() => router.replace("/surucu")} showSkip />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-10 w-10 text-green-600" />
            <span className="text-2xl font-bold text-green-700 dark:text-green-500">GetDriver</span>
          </Link>
          <CardTitle className="text-2xl">Sürücü Başvurusu</CardTitle>
          <CardDescription>
            {step === 1 && "Kişisel bilgilerinizi girin"}
            {step === 2 && "Belgelerinizi yükleyin"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-colors ${
                  s <= step ? "bg-green-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
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
                    placeholder="5XX XXX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Adınız Soyadınız"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                  />
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
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <X className="h-3 w-3" /> Şifreler eşleşmiyor
                  </p>
                )}
              </div>

              <Button
                onClick={goToStep2}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!isPasswordValid || password !== confirmPassword}
              >
                Devam Et
              </Button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm">Bilgiler tamamlandı</span>
              </div>

              <div className="space-y-2">
                <Label>Ehliyet Fotoğrafı (Zorunlu)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLicensePhoto(e.target.files?.[0] || null)}
                    className="hidden"
                    id="license"
                  />
                  <label htmlFor="license" className="cursor-pointer">
                    {licensePhoto ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="truncate max-w-[200px]">{licensePhoto.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload className="h-8 w-8" />
                        <span>Tıklayın veya sürükleyin</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Profil Fotoğrafı</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
                    className="hidden"
                    id="profile"
                  />
                  <label htmlFor="profile" className="cursor-pointer">
                    {profilePhoto ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="truncate max-w-[200px]">{profilePhoto.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload className="h-8 w-8" />
                        <span>Tıklayın veya sürükleyin</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Adli Sicil Kaydı Belgesi (Zorunlu)</Label>
                <p className="text-xs text-muted-foreground">
                  e-Devlet üzerinden alınmış adli sicil kaydı belgesini yükleyin
                </p>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setCriminalRecordPhoto(e.target.files?.[0] || null)}
                    className="hidden"
                    id="criminalRecord"
                  />
                  <label htmlFor="criminalRecord" className="cursor-pointer">
                    {criminalRecordPhoto ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="truncate max-w-[200px]">{criminalRecordPhoto.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <FileText className="h-8 w-8" />
                        <span>Tıklayın veya sürükleyin</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <input
                  type="checkbox"
                  id="criminal"
                  checked={criminalDeclare}
                  onChange={(e) => setCriminalDeclare(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="criminal" className="text-sm text-amber-800">
                  <AlertTriangle className="inline h-4 w-4 mr-1" />
                  Yüklediğim adli sicil kaydının doğru ve güncel olduğunu, yanlış belge durumunda hesabımın kapatılacağını kabul ediyorum.
                </label>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Geri
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Başvuruyu Gönder"}
                </Button>
              </div>
            </form>
          )}

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