"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, MapPin, Car, Star, User } from "lucide-react";
import { formatPrice, formatDate, getStatusText, getStatusColor } from "@/lib/utils";

interface DriverHistoryPageProps {
  rides: any[];
}

export function DriverHistoryPage({ rides }: DriverHistoryPageProps) {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Sürüş Geçmişi</h1>

      {rides.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Henüz sürüş geçmişiniz yok</h3>
            <p className="text-gray-500">Tamamlanan sürüşleriniz burada görünecek.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rides.map((ride) => {
            const customer = ride.request?.customer;
            const vehicle = ride.request?.vehicle;
            const rating = ride.ratings?.[0];

            return (
              <Card key={ride.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={customer?.profilePhoto || undefined} />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{customer?.name || "Müşteri"}</p>
                        <p className="text-sm text-gray-500">{formatDate(ride.createdAt)}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(ride.status)}>
                      {getStatusText(ride.status)}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{ride.request?.pickupAddress}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{ride.request?.dropoffAddress}</span>
                    </div>
                  </div>

                  {vehicle && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                      <Car className="h-4 w-4" />
                      <span>{vehicle.brand} {vehicle.model} - {vehicle.plate}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-green-600">{formatPrice(ride.driverAmount)}</span>
                      {rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm">{rating.score}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
