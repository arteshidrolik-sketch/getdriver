import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DriverEarningsPage } from "./_components/driver-earnings-page";

export default async function DriverKazancPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/giris");
  }

  const userId = (session.user as any).id;

  const driver = await prisma.driver.findUnique({
    where: { userId }
  });

  if (!driver) {
    redirect("/surucu");
  }

  // Get this month's earnings
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyRides = await prisma.ride.findMany({
    where: {
      driverId: userId,
      status: "COMPLETED",
      completedAt: {
        gte: startOfMonth
      }
    },
    include: {
      request: true
    },
    orderBy: {
      completedAt: "desc"
    }
  });

  const monthlyEarnings = monthlyRides.reduce((sum: number, ride) => sum + (ride.driverAmount || 0), 0);

  // Get weekly earnings
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const weeklyRides = monthlyRides.filter((ride) => 
    ride.completedAt && new Date(ride.completedAt) >= startOfWeek
  );
  const weeklyEarnings = weeklyRides.reduce((sum: number, ride) => sum + (ride.driverAmount || 0), 0);

  // Get today's earnings
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayRides = monthlyRides.filter((ride) => 
    ride.completedAt && new Date(ride.completedAt) >= startOfDay
  );
  const todayEarnings = todayRides.reduce((sum: number, ride) => sum + (ride.driverAmount || 0), 0);

  return (
    <DriverEarningsPage
      totalEarnings={driver.totalEarnings}
      monthlyEarnings={monthlyEarnings}
      weeklyEarnings={weeklyEarnings}
      todayEarnings={todayEarnings}
      totalRides={driver.totalRides}
      monthlyRides={monthlyRides.length}
      weeklyRides={weeklyRides.length}
      todayRides={todayRides.length}
      recentRides={monthlyRides.slice(0, 10)}
    />
  );
}
