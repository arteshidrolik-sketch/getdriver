"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Eye, FileText, User, Phone, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate, formatPhone } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DriverApplicationsListProps {
  drivers: any[];
}

export function DriverApplicationsList({ drivers }: DriverApplicationsListProps) {
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleAction = async () => {
    if (!selectedDriver || !action) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/drivers/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId: selectedDriver.id,
          action,
          rejectionReason: action === "reject" ? rejectionReason : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: action === "approve" ? "Onaylandı" : "Reddedildi",
          description: action === "approve" 
            ? "Sürücü başvurusu onaylandı" 
            : "Sürücü başvurusu reddedildi",
          variant: action === "approve" ? "success" : "default",
        });
        router.refresh();
      } else {
        toast({
          title: "Hata",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem başarısız",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSelectedDriver(null);
      setAction(null);
      setRejectionReason("");
    }
  };

  if (drivers?.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-medium">Bekleyen başvuru yok</h3>
          <p className="text-muted-foreground">Tüm başvurular işlendi</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {(drivers ?? []).map((driver: any) => (
          <Card key={driver?.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={driver?.user?.profilePhoto} />
                  <AvatarFallback className="text-lg">
                    {driver?.user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{driver?.user?.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {formatPhone(driver?.user?.phone)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(driver?.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Badge variant="warning">Onay Bekliyor</Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {driver?.licensePhoto && (
                      <Badge variant="outline" className="gap-1">
                        <FileText className="h-3 w-3" />
                        Ehliyet Yüklendi
                      </Badge>
                    )}
                    {driver?.criminalRecordPhoto && (
                      <Badge variant="outline" className="gap-1 text-blue-600">
                        <FileText className="h-3 w-3" />
                        Adli Sicil Belgesi
                      </Badge>
                    )}
                    {driver?.criminalRecordDecl && (
                      <Badge variant="outline" className="gap-1 text-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Adli Sicil Beyanı
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setSelectedDriver(driver);
                        setAction("approve");
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Onayla
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSelectedDriver(driver);
                        setAction("reject");
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reddet
                    </Button>
                    {driver?.licensePhoto && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(driver.licensePhoto, "_blank")}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ehliyeti Gör
                      </Button>
                    )}
                    {driver?.criminalRecordPhoto && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(driver.criminalRecordPhoto, "_blank")}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Adli Sicil Belgesi
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Approval Dialog */}
      <Dialog open={action === "approve"} onOpenChange={() => setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sürücüyü Onayla</DialogTitle>
            <DialogDescription>
              {selectedDriver?.user?.name} adlı kişinin sürücü başvurusunu onaylamak istediğinize emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>
              İptal
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleAction}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Onayla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={action === "reject"} onOpenChange={() => setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sürücüyü Reddet</DialogTitle>
            <DialogDescription>
              {selectedDriver?.user?.name} adlı kişinin sürücü başvurusunu reddetmek istediğinize emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Red gerekçesi (opsiyonel)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleAction}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Reddet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}