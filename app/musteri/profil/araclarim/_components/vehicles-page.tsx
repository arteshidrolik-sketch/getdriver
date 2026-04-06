"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Car, Plus, Trash2, Star, Loader2, Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface VehiclesPageProps {
  vehicles: any[];
}

export function VehiclesPage({ vehicles }: VehiclesPageProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({
    plate: "",
    brand: "",
    model: "",
    year: "",
    color: "",
    isDefault: false,
  });
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/customer/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: "Başarılı",
          description: "Araç eklendi",
          variant: "success",
        });
        setOpen(false);
        setForm({ plate: "", brand: "", model: "", year: "", color: "", isDefault: false });
        router.refresh();
      } else {
        toast({
          title: "Hata",
          description: data.error,
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

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/customer/vehicles?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: "Başarılı",
          description: "Araç silindi",
        });
        router.refresh();
      } else {
        toast({
          title: "Hata",
          description: data.error,
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
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Araçlarım</h1>
          <p className="text-muted-foreground">Kayıtlı araçlarınızı yönetin</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Araç Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Araç Ekle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plate">Plaka *</Label>
                <Input
                  id="plate"
                  placeholder="34 ABC 123"
                  value={form.plate}
                  onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marka *</Label>
                  <Input
                    id="brand"
                    placeholder="Volkswagen"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    placeholder="Passat"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Yıl</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="2020"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Renk</Label>
                  <Input
                    id="color"
                    placeholder="Siyah"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="default">Varsayılan Araç</Label>
                <Switch
                  id="default"
                  checked={form.isDefault}
                  onCheckedChange={(checked) => setForm({ ...form, isDefault: checked })}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Araç Ekle
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vehicle List */}
      <div className="space-y-3">
        {(vehicles ?? []).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium">Henüz araç eklenmedi</h3>
              <p className="text-sm text-muted-foreground">Talep oluşturmak için araç ekleyin</p>
            </CardContent>
          </Card>
        ) : (
          (vehicles ?? []).map((vehicle: any) => (
            <Card key={vehicle?.id}>
              <CardContent className="p-4 flex items-center">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 mr-3">
                  <Car className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{vehicle?.brand} {vehicle?.model}</span>
                    {vehicle?.isDefault && (
                      <Badge variant="success" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Varsayılan
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {vehicle?.plate}
                    {vehicle?.year && ` • ${vehicle.year}`}
                    {vehicle?.color && ` • ${vehicle.color}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(vehicle?.id)}
                  disabled={deleting === vehicle?.id}
                >
                  {deleting === vehicle?.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}