"use client";

import { useState } from "react";
import { Car, Search, CheckCircle, XCircle, Eye, Ban, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";

interface Driver {
  id: string;
  approvalStatus: string;
  isOnline: boolean;
  licenseNumber: string | null;
  user: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    status: string;
    createdAt: string;
  };
  vehicle: {
    brand: string;
    model: string;
    plate: string;
  } | null;
  _count: { rides: number };
}

interface DriverManagementProps {
  drivers: Driver[];
}

export function DriverManagement({ drivers }: DriverManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "offline" | "pending">("all");

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      !searchQuery ||
      d.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.user.phone.includes(searchQuery);

    const matchesFilter =
      filter === "all" ||
      (filter === "online" && d.isOnline) ||
      (filter === "offline" && !d.isOnline) ||
      (filter === "pending" && d.approvalStatus === "PENDING");

    return matchesSearch && matchesFilter;
  });

  const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    APPROVED: { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Onaylı" },
    PENDING: { color: "bg-amber-100 text-amber-700", icon: XCircle, label: "Bekliyor" },
    REJECTED: { color: "bg-red-100 text-red-700", icon: XCircle, label: "Reddedildi" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sürücüler</h1>
          <p className="text-muted-foreground">Tüm sürücüleri görüntüleyin ve yönetin</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sürücü ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Tümü ({drivers.length})
        </Button>
        <Button
          variant={filter === "online" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("online")}
        >
          Çevrimiçi ({drivers.filter((d) => d.isOnline).length})
        </Button>
        <Button
          variant={filter === "offline" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("offline")}
        >
          Çevrimdışı ({drivers.filter((d) => !d.isOnline).length})
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("pending")}
        >
          Bekleyen ({drivers.filter((d) => d.approvalStatus === "PENDING").length})
        </Button>
      </div>

      {/* Drivers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.map((driver) => {
          const status = statusConfig[driver.approvalStatus] || statusConfig.PENDING;
          const StatusIcon = status.icon;

          return (
            <Card key={driver.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Car className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{driver.user.name || "İsimsiz"}</p>
                      <p className="text-sm text-muted-foreground">{driver.user.phone}</p>
                    </div>
                  </div>
                  <Badge className={status.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  {driver.vehicle && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Car className="h-4 w-4" />
                      <span>{driver.vehicle.brand} {driver.vehicle.model}</span>
                      <span className="font-mono">{driver.vehicle.plate}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{driver._count.rides} yolculuk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${driver.isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                    <span className="text-muted-foreground">
                      {driver.isOnline ? "Çevrimiçi" : "Çevrimdışı"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    Detay
                  </Button>
                  {driver.approvalStatus === "PENDING" && (
                    <Button variant="default" size="sm" className="flex-1 bg-green-600">
                      Onayla
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredDrivers.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Sürücü bulunamadı
          </div>
        )}
      </div>
    </div>
  );
}