"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, Calendar, Clock, Car } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

interface DriverEarningsPageProps {
  totalEarnings: number;
  monthlyEarnings: number;
  weeklyEarnings: number;
  todayEarnings: number;
  totalRides: number;
  monthlyRides: number;
  weeklyRides: number;
  todayRides: number;
  recentRides: any[];
}

export function DriverEarningsPage({
  totalEarnings,
  monthlyEarnings,
  weeklyEarnings,
  todayEarnings,
  totalRides,
  monthlyRides,
  weeklyRides,
  todayRides,
  recentRides
}: DriverEarningsPageProps) {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Kazançlarım</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Bugün</span>
            </div>
            <p className="text-xl font-bold text-green-600">{formatPrice(todayEarnings)}</p>
            <p className="text-sm text-gray-500">{todayRides} sürüş</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Bu Hafta</span>
            </div>
            <p className="text-xl font-bold text-green-600">{formatPrice(weeklyEarnings)}</p>
            <p className="text-sm text-gray-500">{weeklyRides} sürüş</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Bu Ay</span>
            </div>
            <p className="text-xl font-bold text-green-600">{formatPrice(monthlyEarnings)}</p>
            <p className="text-sm text-gray-500">{monthlyRides} sürüş</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Wallet className="h-4 w-4" />
              <span className="text-sm">Toplam</span>
            </div>
            <p className="text-xl font-bold text-green-600">{formatPrice(totalEarnings)}</p>
            <p className="text-sm text-gray-500">{totalRides} sürüş</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Rides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Son Sürüşler
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentRides.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Henüz tamamlanmış sürüşünüz yok.</p>
          ) : (
            <div className="space-y-3">
              {recentRides.map((ride) => (
                <div key={ride.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{ride.request?.dropoffAddress}</p>
                    <p className="text-xs text-gray-500">{formatDate(ride.completedAt)}</p>
                  </div>
                  <span className="font-bold text-green-600">{formatPrice(ride.driverAmount || 0)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
