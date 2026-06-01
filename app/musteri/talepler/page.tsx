import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { CustomerRequestsPage } from "./_components/customer-requests-page";

export const dynamic = "force-dynamic";

export default async function TaleplerimPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/giris");
  }

  const userId = (session.user as any).id;

  const requests = await prisma.rideRequest.findMany({
    where: { customerId: userId },
    include: {
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
    },
    orderBy: { createdAt: "desc" }
  });

  return <CustomerRequestsPage requests={requests} />;
}
