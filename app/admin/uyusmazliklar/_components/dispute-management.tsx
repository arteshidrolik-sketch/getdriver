"use client";

import { useState } from "react";
import { AlertTriangle, Search, Clock, CheckCircle, XCircle, MessageSquare, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";

interface Dispute {
  id: string;
  status: string;
  reason: string;
  resolution: string | null;
  createdAt: string;
  ride: {
    id: string;
    price: number;
    request: {
      customer: { name: string; phone: string };
    };
    driver: {
      user: { name: string; phone: string };
    } | null;
  };
}

interface DisputeStats {
  status: string;
  _count: number;
}

interface DisputeManagementProps {
  disputes: Dispute[];
  stats: DisputeStats[];
}

export function DisputeManagement({ disputes, stats }: DisputeManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredDisputes = disputes.filter((d) => {
    const matchesSearch =
      !searchQuery ||
      d.ride.request.customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.ride.request.customer.phone.includes(searchQuery) ||
      d.reason.toLowerCase().includes(searchQuery);

    const matchesFilter = statusFilter === "all" || d.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    OPEN: { color: "bg-red-100 text-red-700", icon: AlertTriangle, label: "Açık" },
    UNDER_REVIEW: { color: "bg-amber-100 text-amber-700", icon: Clock, label: "İncelemede" },
    RESOLVED: { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Çözüldü" },
    CLOSED: { color: "bg-gray-100 text-gray-700", icon: XCircle, label: "Kapandı" },
  };

  const getStatusCount = (status: string) => {
    const found = stats.find((s) => s.status === status);
    return found?._count || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Uyuşmazlıklar</h1>
          <p className="text-muted-foreground">Çözüm bekleyen sorunlar</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Açık</p>
                <p className="text-xl font-bold">{getStatusCount("OPEN")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">İncelemede</p>
                <p className="text-xl font-bold">{getStatusCount("UNDER_REVIEW")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Çözüldü</p>
                <p className="text-xl font-bold">{getStatusCount("RESOLVED")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gray-100">
                <XCircle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Kapalı</p>
                <p className="text-xl font-bold">{getStatusCount("CLOSED")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          Tümü
        </Button>
        {Object.keys(statusConfig).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {statusConfig[status].label} ({getStatusCount(status)})
          </Button>
        ))}
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {filteredDisputes.map((dispute) => {
          const status = statusConfig[dispute.status] || statusConfig.OPEN;
          const StatusIcon = status.icon;

          return (
            <Card key={dispute.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-red-100">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">{dispute.ride.request.customer.name}</p>
                      <p className="text-sm text-muted-foreground">{dispute.ride.request.customer.phone}</p>
                    </div>
                  </div>
                  <Badge className={status.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>

                <div className="bg-muted/50 rounded-lg p-3 mb-3">
                  <p className="text-sm font-medium mb-1">Şikayet:</p>
                  <p className="text-sm text-muted-foreground">{dispute.reason}</p>
                </div>

                {dispute.resolution && (
                  <div className="bg-green-50 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium mb-1 text-green-700">Çözüm:</p>
                    <p className="text-sm text-green-600">{dispute.resolution}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      Yolculuk: {formatPrice(dispute.ride.price)}
                    </span>
                    {dispute.ride.driver && (
                      <span className="text-muted-foreground">
                        Sürücü: {dispute.ride.driver.user.name}
                      </span>
                    )}
                  </div>
                  <span className="text-muted-foreground">{formatDate(dispute.createdAt)}</span>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    Detay
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Mesaj Gönder
                  </Button>
                  {dispute.status !== "RESOLVED" && (
                    <Button variant="default" size="sm" className="flex-1 bg-green-600">
                      Çözümle
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredDisputes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Uyuşmazlık bulunamadı
          </div>
        )}
      </div>
    </div>
  );
}