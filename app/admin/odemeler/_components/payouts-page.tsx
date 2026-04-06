"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Banknote,
  Download,
  Loader2,
  Users,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Wallet,
  Search,
  Send,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";

interface Driver {
  id: string;
  userId: string;
  iban: string | null;
  ibanHolderName: string | null;
  pendingPayout: number;
  totalEarnings: number;
  lastPayoutDate: string | null;
  lastPayoutAmount: number | null;
  user: {
    name: string | null;
    phone: string | null;
    email: string | null;
  };
  payouts: any[];
}

interface Stats {
  totalDrivers: number;
  totalPendingPayout: number;
  driversWithPending: number;
  driversWithoutIban: number;
}

export function PayoutsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, [filter]);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payouts?filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setDrivers(data.drivers);
        setStats(data.stats);
      }
    } catch (error) {
      toast({ title: "Hata", description: "Veriler yüklenemedi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExportLoading(true);
    try {
      const res = await fetch("/api/admin/payouts/export");
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `surucu-odemeleri-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast({ title: "Başarılı", description: "CSV dosyası indirildi" });
      }
    } catch (error) {
      toast({ title: "Hata", description: "Export başarısız", variant: "destructive" });
    } finally {
      setExportLoading(false);
    }
  };

  const openPayoutDialog = (driver: Driver) => {
    setSelectedDriver(driver);
    setPayoutAmount(driver.pendingPayout.toFixed(2));
    setPayoutNotes("");
    setPayoutDialogOpen(true);
  };

  const handlePayout = async () => {
    if (!selectedDriver || !payoutAmount) return;

    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Hata", description: "Geçerli bir miktar girin", variant: "destructive" });
      return;
    }

    if (amount > selectedDriver.pendingPayout) {
      toast({ title: "Hata", description: "Ödeme miktarı bekleyen tutardan fazla olamaz", variant: "destructive" });
      return;
    }

    setPayoutLoading(true);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId: selectedDriver.id,
          amount,
          notes: payoutNotes
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Bir hata oluştu");
      }

      toast({ title: "Başarılı", description: "Ödeme kaydedildi" });
      setPayoutDialogOpen(false);
      fetchDrivers();
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } finally {
      setPayoutLoading(false);
    }
  };

  const formatIban = (iban: string | null) => {
    if (!iban) return "-";
    const groups = iban.match(/.{1,4}/g);
    return groups ? groups.join(" ") : iban;
  };

  const filteredDrivers = drivers.filter(d => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      d.user.name?.toLowerCase().includes(search) ||
      d.user.phone?.includes(search) ||
      d.iban?.includes(search.replace(/\s/g, ""))
    );
  });

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Sürücü Ödemeleri</h1>
        <Button onClick={handleExportCSV} disabled={exportLoading} variant="outline">
          {exportLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
          CSV İndir
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">Onaylı Sürücü</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalDrivers}</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <Wallet className="h-4 w-4" />
                <span className="text-sm">Toplam Bekleyen</span>
              </div>
              <p className="text-2xl font-bold text-green-700">{formatPrice(stats.totalPendingPayout)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Banknote className="h-4 w-4" />
                <span className="text-sm">Ödeme Bekleyen</span>
              </div>
              <p className="text-2xl font-bold">{stats.driversWithPending}</p>
            </CardContent>
          </Card>
          <Card className={stats.driversWithoutIban > 0 ? "border-amber-200 bg-amber-50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">IBAN Eksik</span>
              </div>
              <p className="text-2xl font-bold text-amber-700">{stats.driversWithoutIban}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Sürücü ara (isim, telefon, IBAN)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Sürücüler</SelectItem>
                <SelectItem value="pending">Ödeme Bekleyenler</SelectItem>
                <SelectItem value="noIban">IBAN Eksik</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Drivers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sürücü Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Sürücü bulunamadı</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sürücü</TableHead>
                    <TableHead>IBAN</TableHead>
                    <TableHead className="text-right">Bekleyen</TableHead>
                    <TableHead className="text-right">Toplam</TableHead>
                    <TableHead className="text-center">Durum</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{driver.user.name || "-"}</p>
                          <p className="text-sm text-gray-500">{driver.user.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {driver.iban ? (
                          <div>
                            <p className="font-mono text-xs">{formatIban(driver.iban)}</p>
                            <p className="text-xs text-gray-500">{driver.ibanHolderName}</p>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-300">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Eksik
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={driver.pendingPayout > 0 ? "text-green-600 font-semibold" : ""}>
                          {formatPrice(driver.pendingPayout)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(driver.totalEarnings)}
                      </TableCell>
                      <TableCell className="text-center">
                        {driver.iban && driver.pendingPayout > 0 ? (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Hazır
                          </Badge>
                        ) : driver.pendingPayout === 0 ? (
                          <Badge variant="outline">Temiz</Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600">
                            IBAN Bekleniyor
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => openPayoutDialog(driver)}
                          disabled={!driver.iban || driver.pendingPayout <= 0}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Öde
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Dialog */}
      <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ödeme Kaydet</DialogTitle>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sürücü:</span>
                  <span className="font-medium">{selectedDriver.user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Telefon:</span>
                  <span>{selectedDriver.user.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">IBAN:</span>
                  <span className="font-mono text-sm">{formatIban(selectedDriver.iban)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hesap Sahibi:</span>
                  <span>{selectedDriver.ibanHolderName}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-500">Bekleyen Tutar:</span>
                  <span className="font-bold text-green-600">{formatPrice(selectedDriver.pendingPayout)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ödeme Miktarı (TL)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  max={selectedDriver.pendingPayout}
                />
              </div>

              <div className="space-y-2">
                <Label>Not (Opsiyonel)</Label>
                <Input
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="Transfer referansı, tarih vb."
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                <strong>Önemli:</strong> Bu işlemi yapmadan önce banka transferini gerçekleştirdiğinizden emin olun. 
                Bu buton yalnızca sistemde ödemenin yapıldığını kaydeder.
              </div>

              <Button
                onClick={handlePayout}
                disabled={payoutLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {payoutLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Ödemeyi Onayla
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
