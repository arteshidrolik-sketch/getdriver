import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { DriverReservationsList } from "./_components/driver-reservations-list";

export const dynamic = "force-dynamic";

export default async function DriverReservationsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/giris");
  }

  const driver = await prisma.driver.findUnique({
    where: { userId },
  });

  if (!driver) {
    redirect("/surucu");
  }

  // Yaklaşan rezervasyonları getir (1 saat içinde başlayacaklar)
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  const upcomingReservations = await prisma.rideRequest.findMany({
    where: {
      isReservation: true,
      status: "ACTIVE",
      scheduledAt: {
        gte: now,
        lte: oneHourLater,
      },
    },
    include: {
      customer: {
        select: { name: true, phone: true, profilePhoto: true },
      },
      vehicle: true,
      offers: {
        where: { driverId: driver.id },
      },
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });

  // Tüm rezervasyonları getir (sonraki 24 saat)
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const allReservations = await prisma.rideRequest.findMany({
    where: {
      isReservation: true,
      status: "ACTIVE",
      scheduledAt: {
        gte: now,
        lte: next24Hours,
      },
    },
    include: {
      customer: {
        select: { name: true, phone: true, profilePhoto: true },
      },
      vehicle: true,
      offers: {
        where: { driverId: driver.id },
      },
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Rezervasyonlar</h1>
      <DriverReservationsList 
        upcomingReservations={JSON.parse(JSON.stringify(upcomingReservations))}
        allReservations={JSON.parse(JSON.stringify(allReservations))}
        driverId={driver.id}
      />
    </div>
  );
}
