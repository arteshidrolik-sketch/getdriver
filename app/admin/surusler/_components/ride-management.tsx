"use client";

import { useState } from "react";
import { Navigation, Search, Clock, CheckCircle, XCircle, Car, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";

interface Ride {
  id: string;
  status: string;
  price: number;
  platformFee: number;
  createdAt: string;
  pickupAddress: string | null;
  dropoffAddress: string | null;
  request: {
    customer: { name: string; phone: string };
    vehicle: { brand: string; model: string; plate: string } | null;
  };
  driver: {
    user: { name: string; phone: string };
  } | null;
}

interface RideStats {
  status: string;
  _count: number;
}

interface RideManagementProps {
  rides: Ride[];
  stats: RideStats[];
}

export function RideManagement({ rides, stats }: RideManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredRides = rides.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.request.customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.request.customer.phone.includes(searchQuery) ||
      r.id.toLowerCase().includes(searchQuery);

    const matchesFilter = statusFilter === "all" || r.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    PENDING_PICKUP: { color: "bg-blue-100 text-blue-700", icon: Clock, label: "Bekliyor" },
    DRIVER_ARRIVED: { color: "bg-cyan-100 text-cyan-700", icon: MapPin, label: "Sürücü Varış" },
    PHOTOS_BEFORE: { color: "bg-purple-100 text-purple-700", icon: Car, label: "Fotoğraf" },
    IN_PROGRESS: { color: "bg-amber-100 text-amber-700", icon: Navigation, label: "Devam Ediyor" },
    PHOTOS_AFTER: { color: "bg-indigo-100 text-indigo-700", icon: Car, label: "Fotoğraf" },
    COMPLETED: { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Tamamlandı" },
    CANCELLED: { color: "bg-red-100 text-red-700", icon: XCircle, label: "İptal" },
    DISPUTED: { color: "bg-orange-100 text-orange-700", icon: XCircle, label: "Uyuşmazlık" },
  };

  const getStatusCount = (status: string) => {
    const found = stats.find((s) => s.status === status);
    return found?._count || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sürüşler</h1>
          <p className="text-muted-foreground">Tüm yolculukları görüntüleyin</p>
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
              <div className="p-2 rounded-full bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bekleyen</p>
                <p className="text-xl font-bold">{getStatusCount("PENDING_PICKUP")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-100">
                <Navigation className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Aktif</p>
                <p className="text-xl font-bold">{getStatusCount("IN_PROGRESS")}</p>
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
                <p className="text-xs text-muted-foreground">Tamamlanan</p>
                <p className="text-xl font-bold">{getStatusCount("COMPLETED")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">İptal</p>
                <p className="text-xl font-bold">{getStatusCount("CANCELLED")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
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

      {/* Rides Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">ID</th>
                  <th className="text-left py-3 px-2 font-medium">Müşteri</th>
                  <th className="text-left py-3 px-2 font-medium">Sürücü</th>
                  <th className="text-left py-3 px-2 font-medium">Araç</th>
                  <th className="text-left py-3 px-2 font-medium">Tutar</th>
                  <th className="text-left py-3 px-2 font-medium">Durum</th>
                  <th className="text-left py-3 px-2 font-medium">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {filteredRides.map((ride) => {
                  const status = statusConfig[ride.status] || statusConfig.PENDING_PICKUP;
                  const StatusIcon = status.icon;

                  return (
                    <tr key={ride.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-mono text-xs">{ride.id.slice(0, 8)}...</td>
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium">{ride.request.customer.name || "-"}</p>
                          <p className="text-xs text-muted-foreground">{ride.request.customer.phone}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        {ride.driver ? (
                          <div>
                            <p className="font-medium">{ride.driver.user.name || "-"}</p>
                            <p className="text-xs text-muted-foreground">{ride.driver.user.phone}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {ride.request.vehicle ? (
                          <span className="font-mono text-xs">
                            {ride.request.vehicle.plate}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-2 font-medium">{formatPrice(ride.price)}</td>
                      <td className="py-3 px-2">
                        <Badge className={status.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {formatDate(ride.createdAt)}
                      </td>
                    </tr>
                  );
                })}
                {filteredRides.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Sürüş bulunamadı
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