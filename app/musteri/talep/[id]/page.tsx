import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { RequestDetailPage } from "./_components/request-detail-page";

interface PageProps {
  params: { id: string };
}

export default async function TalepDetayPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/giris");
  }

  const userId = (session.user as any).id;

  const request = await prisma.rideRequest.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      vehicle: true,
      offers: {
        include: {
          driver: {
            include: {
              user: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      ride: true
    }
  });

  if (!request || request.customerId !== userId) {
    notFound();
  }

  return <RequestDetailPage request={request} />;
}
