import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DriverHistoryPage } from "./_components/driver-history-page";

export default async function DriverGecmisPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/giris");
  }

  const userId = (session.user as any).id;

  const rides = await prisma.ride.findMany({
    where: {
      driverId: userId,
      status: {
        in: ["COMPLETED", "CANCELLED"]
      }
    },
    include: {
      request: {
        include: {
          customer: true,
          vehicle: true
        }
      },
      ratings: true
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 50
  });

  return <DriverHistoryPage rides={rides} />;
}
