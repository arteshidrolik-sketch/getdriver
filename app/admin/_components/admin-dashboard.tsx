"use client";

import Link from "next/link";
import { Users, Car, Navigation, AlertTriangle, CreditCard, Clock, TrendingUp, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate, getStatusText, getStatusColor } from "@/lib/utils";

interface AdminDashboardProps {
  stats: {
    totalUsers: number;
    totalDrivers: number;
    pendingDrivers: number;
    totalRides: number;
    completedRides: number;
    totalRevenue: number;
    platformRevenue: number;
    activeRequests: number;
    openDisputes: number;
    openTickets: number;
  };
  recentRides: any[];
}

export function AdminDashboard({ stats, recentRides }: AdminDashboardProps) {
  const statCards = [
    {
      label: "Toplam Müşteriler",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Aktif Sürücüler",
      value: stats.totalDrivers,
      icon: Car,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Bekleyen Başvuru",
      value: stats.pendingDrivers,
      icon: UserCheck,
      color: "text-amber-600",
      bg: "bg-amber-100",
      href: "/admin/surucu-basvurulari",
    },
    {
      label: "Toplam Sürüş",
      value: stats.totalRides,
      icon: Navigation,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Toplam Ciro",
      value: formatPrice(stats.totalRevenue),
      icon: CreditCard,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      label: "Platform Geliri",
      value: formatPrice(stats.platformRevenue),
      icon: TrendingUp,
      color: "text-cyan-600",
      bg: "bg-cyan-100",
    },
    {
      label: "Aktif Talepler",
      value: stats.activeRequests,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      label: "Açık Uyuşmazlıklar",
      value: stats.openDisputes,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-100",
      href: "/admin/uyusmazliklar",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">GetDriver platform yönetimi</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Link key={i} href={stat.href || "#"} className={stat.href ? "" : "pointer-events-none"}>
            <Card className={`hover:shadow-lg transition-shadow ${stat.href ? "cursor-pointer" : ""}`}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Alerts */}
      {(stats.pendingDrivers > 0 || stats.openDisputes > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {stats.pendingDrivers > 0 && (
            <Link href="/admin/surucu-basvurulari">
              <Card className="border-amber-200 bg-amber-50 cursor-pointer hover:shadow-lg">
                <CardContent className="p-4 flex items-center gap-3">
                  <UserCheck className="h-8 w-8 text-amber-600" />
                  <div>
                    <p className="font-medium">{stats.pendingDrivers} Bekleyen Sürücü Başvurusu</p>
                    <p className="text-sm text-muted-foreground">İnceleme bekliyor</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
          {stats.openDisputes > 0 && (
            <Link href="/admin/uyusmazliklar">
              <Card className="border-red-200 bg-red-50 cursor-pointer hover:shadow-lg">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="font-medium">{stats.openDisputes} Açık Uyuşmazlık</p>
                    <p className="text-sm text-muted-foreground">İnceleme bekliyor</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      )}

      {/* Recent Rides */}
      <Card>
        <CardHeader>
          <CardTitle>Son Sürüşler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Müşteri</th>
                  <th className="text-left py-2 px-2">Sürücü</th>
                  <th className="text-left py-2 px-2">Araç</th>
                  <th className="text-left py-2 px-2">Tutar</th>
                  <th className="text-left py-2 px-2">Durum</th>
                  <th className="text-left py-2 px-2">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {(recentRides ?? []).map((ride: any) => (
                  <tr key={ride?.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2">{ride?.request?.customer?.name}</td>
                    <td className="py-2 px-2">{ride?.driver?.user?.name}</td>
                    <td className="py-2 px-2">
                      {ride?.request?.vehicle?.brand} {ride?.request?.vehicle?.plate}
                    </td>
                    <td className="py-2 px-2 font-medium">{formatPrice(ride?.price ?? 0)}</td>
                    <td className="py-2 px-2">
                      <Badge className={getStatusColor(ride?.status || "")}>
                        {getStatusText(ride?.status || "")}
                      </Badge>
                    </td>
                    <td className="py-2 px-2 text-muted-foreground">
                      {formatDate(ride?.createdAt)}
                    </td>
                  </tr>
                ))}
                {(recentRides?.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Henüz sürüş yok
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