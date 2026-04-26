"use client";

import { useState } from "react";
import { TrendingUp, Users, Car, CreditCard, Calendar, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

interface Stats {
  totalRides30d: number;
  completedRides30d: number;
  totalRevenue30d: number;
  avgRidePrice: number;
  topDrivers: { id: string; name: string; phone: string; rideCount: number }[];
  topCustomers: { id: string; name: string; rideCount: number }[];
  vehicleBrands: { brand: string; count: number }[];
  dailyRides: { date: string; total: number; completed: number; revenue: number }[];
  dailyRevenue: { date: string; amount: number }[];
}

export function AnalyticsDashboard({ stats }: { stats: Stats }) {
  const [period, setPeriod] = useState<"7d" | "30d">("30d");

  const completionRate = stats.totalRides30d > 0
    ? Math.round((stats.completedRides30d / stats.totalRides30d) * 100)
    : 0;

  // Get data for selected period
  const filteredDailyRides = period === "7d" 
    ? stats.dailyRides.slice(-7) 
    : stats.dailyRides;

  const filteredDailyRevenue = period === "7d"
    ? stats.dailyRevenue.slice(-7)
    : stats.dailyRevenue;

  const maxRevenue = Math.max(...filteredDailyRevenue.map((d) => d.amount), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analitik</h1>
          <p className="text-muted-foreground">Son 30 günün performansı</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={period === "7d" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("7d")}
          >
            7 Gün
          </Button>
          <Button
            variant={period === "30d" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("30d")}
          >
            30 Gün
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Toplam Yolculuk</p>
                <p className="text-xl font-bold">{stats.totalRides30d}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tamamlanan</p>
                <p className="text-xl font-bold">{stats.completedRides30d}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-100">
                <CreditCard className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Toplam Gelir</p>
                <p className="text-xl font-bold">{formatPrice(stats.totalRevenue30d)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100">
                <Car className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ort. Yolculuk</p>
                <p className="text-xl font-bold">{formatPrice(stats.avgRidePrice)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Günlük Gelir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end gap-2">
            {filteredDailyRevenue.map((day) => {
              const height = (day.amount / maxRevenue) * 100;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t"
                    style={{ height: `${height}%`, minHeight: day.amount > 0 ? "4px" : "0" }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {new Date(day.date).toLocaleDateString("tr", { month: "short", day: "numeric" })}
                  </span>
                  <span className="text-xs font-medium">{formatPrice(day.amount)}</span>
                </div>
              );
            })}
            {filteredDailyRevenue.length === 0 && (
              <div className="flex-1 flex items-center justify-center h-full text-muted-foreground">
                Veri yok
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Drivers & Customers */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-green-600" />
              En Çok Yolculuk Yapan Sürücüler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topDrivers.map((driver, i) => (
                <div key={driver.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{driver.name}</p>
                    <p className="text-xs text-muted-foreground">{driver.phone}</p>
                  </div>
                  <Badge variant="secondary">{driver.rideCount} yolculuk</Badge>
                </div>
              ))}
              {stats.topDrivers.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Veri yok</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              En Aktif Müşteriler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topCustomers.map((customer, i) => (
                <div key={customer.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{customer.name}</p>
                  </div>
                  <Badge variant="secondary">{customer.rideCount} yolculuk</Badge>
                </div>
              ))}
              {stats.topCustomers.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Veri yok</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Brands */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-purple-600" />
            Araç Markaları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stats.vehicleBrands.map((vb) => (
              <div
                key={vb.brand}
                className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full flex items-center gap-2"
              >
                <Car className="h-4 w-4" />
                <span>{vb.brand}</span>
                <Badge variant="secondary">{vb.count}</Badge>
              </div>
            ))}
            {stats.vehicleBrands.length === 0 && (
              <p className="text-muted-foreground">Veri yok</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium">Tamamlanma Oranı</p>
              <p className="text-sm text-muted-foreground">Son {period === "7d" ? "7" : "30"} gün</p>
            </div>
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3"
                  strokeDasharray={`${completionRate}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{completionRate}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}