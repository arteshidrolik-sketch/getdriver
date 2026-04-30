import { RideManagement } from "./_components/ride-management";

export const dynamic = "force-dynamic";

export default async function RidesPage() {
  let rides: any[] = [];
  let stats: any[] = [];

  try {
    const { prisma } = await import("@/lib/db");
    rides = await prisma.ride.findMany({
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
    stats = await prisma.ride.groupBy({
      by: ["status"],
      _count: true,
    });
    rides = JSON.parse(JSON.stringify(rides));
    stats = JSON.parse(JSON.stringify(stats));
  } catch (e) {
    // Database not available
  }

  return (
    <RideManagement
      rides={rides}
      stats={stats}
    />
  );
}
