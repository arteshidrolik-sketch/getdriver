"use client";

import Link from "next/link";
import { Clock, MapPin, Car, Star, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatPrice, formatDate, getStatusText, getStatusColor } from "@/lib/utils";

interface RideHistoryPageProps {
  rides: any[];
}

export function RideHistoryPage({ rides }: RideHistoryPageProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sürüş Geçmişi</h1>
        <p className="text-muted-foreground">Tamamlanan ve iptal edilen sürüşleriniz</p>
      </div>

      {(rides ?? []).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium">Henüz sürüş geçmişiniz yok</h3>
            <p className="text-sm text-muted-foreground">Tamamlanan sürüşleriniz burada görünecek</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(rides ?? []).map((ride: any) => (
            <Link key={ride?.id} href={`/musteri/gecmis/${ride?.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={ride?.driver?.user?.profilePhoto} />
                      <AvatarFallback>{ride?.driver?.user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{ride?.driver?.user?.name}</span>
                        <Badge className={getStatusColor(ride?.status)}>
                          {ride?.status === "COMPLETED" ? (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {getStatusText(ride?.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {ride?.request?.dropoffAddress}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          <Car className="h-3 w-3 inline mr-1" />
                          {ride?.request?.vehicle?.brand} {ride?.request?.vehicle?.plate}
                        </span>
                        <span className="font-semibold text-green-600">
                          {formatPrice(ride?.price ?? 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(ride?.completedAt || ride?.createdAt)}
                        </span>
                        {(ride?.ratings?.length ?? 0) > 0 ? (
                          <span className="text-xs flex items-center text-amber-500">
                            <Star className="h-3 w-3 fill-current mr-1" />
                            {ride?.ratings?.[0]?.score}/5 puan verdiniz
                          </span>
                        ) : ride?.status === "COMPLETED" ? (
                          <span className="text-xs text-blue-600">Puanlamak için tıklayın</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}