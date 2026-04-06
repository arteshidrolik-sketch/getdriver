import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { DriverRidePage } from "./_components/driver-ride-page";

interface PageProps {
  params: { id: string };
}

export default async function SurucuYolculukPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/giris");
  }

  const userId = (session.user as any).id;

  const ride = await prisma.ride.findUnique({
    where: { id: params.id },
    include: {
      request: {
        include: {
          customer: true,
          vehicle: true
        }
      },
      offer: true,
      driver: {
        include: {
          user: true
        }
      },
      photos: true,
      payment: true,
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  // ride.driverId is Driver table ID, not User ID
  // Check if the driver's userId matches the session userId
  if (!ride || ride.driver?.user?.id !== userId) {
    notFound();
  }

  return <DriverRidePage ride={ride} />;
}
