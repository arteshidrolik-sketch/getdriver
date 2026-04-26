"use client";

import { useState } from "react";
import { CreditCard, TrendingUp, Search, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice, formatDate } from "@/lib/utils";

interface Payment {
  id: string;
  amount: number;
  status: string;
  type: string;
  createdAt: string;
  user: { name: string; phone: string };
  ride: { id: string; price: number };
}

interface PaymentManagementProps {
  payments: Payment[];
  stats: {
    totalPayments: number;
    totalAmount: number;
  };
}

export function PaymentManagement({ payments, stats }: PaymentManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "pending" | "failed">("all");

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user?.phone?.includes(searchQuery) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "completed" && p.status === "COMPLETED") ||
      (filter === "pending" && p.status === "PENDING") ||
      (filter === "failed" && p.status === "FAILED");

    return matchesSearch && matchesFilter;
  });

  const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
    COMPLETED: { icon: CheckCircle, color: "text-green-600 bg-green-100", label: "Tamamlandı" },
    PENDING: { icon: Clock, color: "text-amber-600 bg-amber-100", label: "Bekliyor" },
    FAILED: { icon: XCircle, color: "text-red-600 bg-red-100", label: "Başarısız" },
    PRE_AUTH: { icon: Clock, color: "text-blue-600 bg-blue-100", label: "Ön Otorizasyon" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ödeme Yönetimi</h1>
          <p className="text-muted-foreground">Tüm ödemeleri görüntüleyin ve yönetin</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Toplam Ödeme</p>
                <p className="text-xl font-bold">{stats.totalPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-100">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tahsil Edilen</p>
                <p className="text-xl font-bold">{formatPrice(stats.totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-cyan-100">
                <TrendingUp className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Platform Geliri</p>
                <p className="text-xl font-bold">{formatPrice(stats.totalAmount * 0.2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ödeme ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="all">Tümü</TabsTrigger>
            <TabsTrigger value="completed">Tamamlanan</TabsTrigger>
            <TabsTrigger value="pending">Bekleyen</TabsTrigger>
            <TabsTrigger value="failed">Başarısız</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">ID</th>
                  <th className="text-left py-3 px-2 font-medium">Kullanıcı</th>
                  <th className="text-left py-3 px-2 font-medium">Tutar</th>
                  <th className="text-left py-3 px-2 font-medium">Durum</th>
                  <th className="text-left py-3 px-2 font-medium">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const config = statusConfig[payment.status] || statusConfig.PENDING;
                  const StatusIcon = config.icon;
                  
                  return (
                    <tr key={payment.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-mono text-xs">{payment.id.slice(0, 8)}...</td>
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium">{payment.user?.name || "-"}</p>
                          <p className="text-xs text-muted-foreground">{payment.user?.phone || "-"}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2 font-medium">{formatPrice(payment.amount)}</td>
                      <td className="py-3 px-2">
                        <Badge className={`${config.color} gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {formatDate(payment.createdAt)}
                      </td>
                    </tr>
                  );
                })}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Ödeme bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}