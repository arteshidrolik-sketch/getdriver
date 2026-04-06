import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { DriverDashboard } from "./_components/driver-dashboard";

export const dynamic = "force-dynamic";

export default async function DriverHomePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const driver = await prisma.driver.findUnique({
    where: { userId },
    include: {
      user: true,
      rides: {
        where: {
          status: { in: ["PENDING_PICKUP", "DRIVER_ARRIVED", "PHOTOS_BEFORE", "IN_PROGRESS", "PHOTOS_AFTER"] },
        },
        include: {
          request: {
            include: { customer: true, vehicle: true },
          },
        },
        take: 1,
      },
    },
  });

  // Get today's stats
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayRides = driver ? await prisma.ride.count({
    where: {
      driverId: driver.id,
      status: "COMPLETED",
      completedAt: { gte: todayStart },
    },
  }) : 0;

  const todayEarnings = driver ? await prisma.ride.aggregate({
    where: {
      driverId: driver.id,
      status: "COMPLETED",
      completedAt: { gte: todayStart },
    },
    _sum: { driverAmount: true },
  }) : { _sum: { driverAmount: 0 } };

  return (
    <DriverDashboard
      driver={driver ? JSON.parse(JSON.stringify(driver)) : null}
      todayRides={todayRides}
      todayEarnings={todayEarnings._sum.driverAmount || 0}
    />
  );
}