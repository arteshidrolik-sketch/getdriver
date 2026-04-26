import { prisma } from "@/lib/db";
import { RideManagement } from "./_components/ride-management";

export const dynamic = "force-dynamic";

export default async function RidesPage() {
  const rides = await prisma.ride.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      request: {
        include: {
          customer: { select: { name: true, phone: true } },
          vehicle: { select: { brand: true, model: true, plate: true } },
        },
      },
      driver: { include: { user: { select: { name: true, phone: true } } } },
    },
  });

  const stats = await prisma.ride.groupBy({
    by: ["status"],
    _count: true,
  });

  return (
    <RideManagement
      rides={JSON.parse(JSON.stringify(rides))}
      stats={JSON.parse(JSON.stringify(stats))}
    />
  );
}