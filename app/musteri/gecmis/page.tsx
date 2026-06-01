import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { RideHistoryPage } from "./_components/ride-history-page";

export const dynamic = "force-dynamic";

export default async function CustomerHistoryPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const rides = await prisma.ride.findMany({
    where: {
      request: { customerId: userId },
      status: { in: ["COMPLETED", "CANCELLED"] },
    },
    include: {
      request: {
        include: { vehicle: true },
      },
      driver: {
        include: { user: true },
      },
      ratings: {
        where: { fromUserId: userId },
      },
    },
    orderBy: { completedAt: "desc" },
    take: 50,
  });

  return <RideHistoryPage rides={JSON.parse(JSON.stringify(rides))} />;
}