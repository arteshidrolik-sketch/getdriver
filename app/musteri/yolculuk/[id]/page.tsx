import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { RideTrackingPage } from "./_components/ride-tracking-page";

interface PageProps {
  params: { id: string };
}

export default async function YolculukPage({ params }: PageProps) {
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

  if (!ride || ride.request.customerId !== userId) {
    notFound();
  }

  return <RideTrackingPage ride={ride} />;
}
