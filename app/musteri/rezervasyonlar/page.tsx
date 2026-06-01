import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { ReservationsList } from "./_components/reservations-list";

export const dynamic = "force-dynamic";

export default async function ReservationsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/giris");
  }

  // Rezervasyonları getir
  const reservations = await prisma.rideRequest.findMany({
    where: {
      customerId: userId,
      isReservation: true,
    },
    include: {
      vehicle: true,
      offers: {
        include: {
          driver: {
            include: {
              user: true,
            },
          },
        },
      },
      ride: true,
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Rezervasyonlarım</h1>
      <ReservationsList 
        reservations={JSON.parse(JSON.stringify(reservations))} 
      />
    </div>
  );
}
