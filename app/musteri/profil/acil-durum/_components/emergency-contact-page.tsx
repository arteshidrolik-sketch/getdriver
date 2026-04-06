"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, ArrowLeft, Phone, User, Loader2, Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface EmergencyContactPageProps {
  emergencyContact: string | null;
}

export function EmergencyContactPage({ emergencyContact }: EmergencyContactPageProps) {
  // Parse existing contact if any
  const parsed = emergencyContact ? parseContact(emergencyContact) : { name: "", phone: "" };
  
  const [name, setName] = useState(parsed.name);
  const [phone, setPhone] = useState(parsed.phone);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  function parseContact(contact: string): { name: string; phone: string } {
    // Format: "Name - Phone"
    const parts = contact.split(" - ");
    if (parts.length === 2) {
      return { name: parts[0], phone: parts[1] };
    }
    return { name: contact, phone: "" };
  }

  const formatPhone = (value: string) => {
    const v = value.replace(/\D/g, "");
    if (v.length <= 3) return v;
    if (v.length <= 6) return `${v.slice(0, 3)} ${v.slice(3)}`;
    return `${v.slice(0, 3)} ${v.slice(3, 6)} ${v.slice(6, 10)}`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({ title: "Hata", description: "Kişi adı girin", variant: "destructive" });
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      toast({ title: "Hata", description: "Geçerli bir telefon numarası girin", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const contactString = `${name.trim()} - ${phone.replace(/\s/g, "")}`;
      
      const res = await fetch("/api/customer/emergency-contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emergencyContact: contactString }),
      });

      const data = await res.json();
      if (data.success) {
        toast({ title: "Başarılı", description: "Acil durum kişisi kaydedildi" });
        router.refresh();
      } else {
        toast({ title: "Hata", description: data.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Hata", description: "Kaydedilemedi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/musteri/profil">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Acil Durum Kişisi</h1>
      </div>

      {/* Info Card */}
      <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
        <CardContent className="p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Önemli:</strong> Acil durum sırasında SOS butonuna bastığınızda 
              bu kişiye otomatik bildirim gönderilecektir. Lütfen güncel bilgileri girin.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Kişi Adı</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Örn: Ahmet Kaya (Babam)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon Numarası</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="5XX XXX XXXX"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className="pl-10"
                  maxLength={14}
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Kaydet
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Current Contact */}
      {emergencyContact && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Mevcut Acil Durum Kişisi:</p>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">{parsed.name}</p>
                <p className="text-sm text-muted-foreground">{parsed.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
