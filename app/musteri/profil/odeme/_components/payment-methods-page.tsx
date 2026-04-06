"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Plus, Trash2, ArrowLeft, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethodsPageProps {
  paymentMethods: any[];
}

export function PaymentMethodsPage({ paymentMethods: initialMethods }: PaymentMethodsPageProps) {
  const [methods, setMethods] = useState(initialMethods);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts: string[] = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const getCardBrand = (number: string) => {
    const n = number.replace(/\s/g, "");
    if (/^4/.test(n)) return "Visa";
    if (/^5[1-5]/.test(n)) return "Mastercard";
    if (/^3[47]/.test(n)) return "Amex";
    if (/^9/.test(n)) return "Troy";
    return "Kart";
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanNumber = cardNumber.replace(/\s/g, "");
    if (cleanNumber.length < 16) {
      toast({ title: "Hata", description: "Geçerli bir kart numarası girin", variant: "destructive" });
      return;
    }
    if (!cardHolder.trim()) {
      toast({ title: "Hata", description: "Kart sahibi adını girin", variant: "destructive" });
      return;
    }
    if (expiry.length < 5) {
      toast({ title: "Hata", description: "Geçerli bir son kullanma tarihi girin", variant: "destructive" });
      return;
    }
    if (cvv.length < 3) {
      toast({ title: "Hata", description: "Geçerli bir CVV girin", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/customer/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardLast4: cleanNumber.slice(-4),
          cardBrand: getCardBrand(cleanNumber),
          cardHolder: cardHolder.trim().toUpperCase(),
          isDefault,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({ title: "Başarılı", description: "Kart eklendi" });
        setDialogOpen(false);
        setCardNumber("");
        setCardHolder("");
        setExpiry("");
        setCvv("");
        setIsDefault(false);
        router.refresh();
        // Update local state
        setMethods(prev => {
          if (isDefault) {
            return [data.paymentMethod, ...prev.map((m: any) => ({ ...m, isDefault: false }))];
          }
          return [...prev, data.paymentMethod];
        });
      } else {
        toast({ title: "Hata", description: data.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Hata", description: "Kart eklenemedi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/customer/payment-methods?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Başarılı", description: "Kart silindi" });
        setMethods(prev => prev.filter((m: any) => m.id !== id));
        router.refresh();
      } else {
        toast({ title: "Hata", description: data.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Hata", description: "Kart silinemedi", variant: "destructive" });
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
        <h1 className="text-xl font-bold">Ödeme Yöntemlerim</h1>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Bilgi:</strong> Kart bilgileriniz güvenli şekilde şifrelenerek saklanır. 
            CVV bilgisi hiçbir zaman sistemimizde tutulmaz.
          </p>
        </CardContent>
      </Card>

      {/* Cards List */}
      {methods.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium">Kayıtlı kart yok</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Hızlı ödeme için bir kart ekleyin
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {methods.map((method: any) => (
            <Card key={method.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 mr-3">
                  <CreditCard className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {method.cardBrand} •••• {method.cardLast4}
                    </p>
                    {method.isDefault && (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        <Star className="h-3 w-3 mr-1" />
                        Varsayılan
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{method.cardHolder}</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Kartı Sil</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bu kartı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>İptal</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleDelete(method.id)}
                      >
                        Sil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Card Button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Kart Ekle
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Kart Ekle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCard} className="space-y-4">
            <div className="space-y-2">
              <Label>Kart Numarası</Label>
              <Input
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
              />
            </div>
            <div className="space-y-2">
              <Label>Kart Sahibi</Label>
              <Input
                placeholder="AD SOYAD"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Son Kullanma</Label>
                <Input
                  placeholder="AA/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label>CVV</Label>
                <Input
                  type="password"
                  placeholder="•••"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                  maxLength={4}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="default">Varsayılan kart olarak ayarla</Label>
              <Switch
                id="default"
                checked={isDefault}
                onCheckedChange={setIsDefault}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                İptal
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Kartı Ekle
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
