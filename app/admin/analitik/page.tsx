import { AnalyticsDashboard } from "./_components/analytics-dashboard";

export const dynamic = "force-dynamic";

const defaultStats = {
  totalRides30d: 0,
  completedRides30d: 0,
  totalRevenue30d: 0,
  avgRidePrice: 0,
  topDrivers: [],
  topCustomers: [],
  vehicleBrands: [],
  dailyRides: [],
  dailyRevenue: [],
};

export default async function AnalyticsPage() {
  let stats = defaultStats;

  try {
    const { prisma } = await import("@/lib/db");
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      ridesByDay,
      revenueByDay,
      topDrivers,
      topCustomers,
      vehicleStats,
    ] = await Promise.all([
      prisma.ride.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: {
          createdAt: true,
          status: true,
          price: true,
        },
      }),
      prisma.payment.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: "COMPLETED",
        },
        select: {
          createdAt: true,
          amount: true,
        },
      }),
      prisma.driver.findMany({
        take: 10,
        orderBy: { rides: { _count: "desc" } },
        include: {
          user: { select: { name: true, phone: true } },
          _count: { select: { rides: true } },
        },
      }),
      prisma.user.findMany({
        where: { role: "CUSTOMER" },
        take: 10,
        orderBy: { rideRequests: { _count: "desc" } },
        include: {
          _count: { select: { rideRequests: true } },
        },
      }),
      prisma.vehicle.groupBy({
        by: ["brand"],
        _count: true,
      }),
    ]);

    const dailyRides = ridesByDay.reduce((acc: any, ride: any) => {
      const day = ride.createdAt.toISOString().split("T")[0];
      if (!acc[day]) acc[day] = { total: 0, completed: 0, revenue: 0 };
      acc[day].total++;
      if (ride.status === "COMPLETED") {
        acc[day].completed++;
        acc[day].revenue += ride.price || 0;
      }
      return acc;
    }, {});

    const dailyPayments = revenueByDay.reduce((acc: any, payment: any) => {
      const day = payment.createdAt.toISOString().split("T")[0];
      if (!acc[day]) acc[day] = 0;
      acc[day] += payment.amount || 0;
      return acc;
    }, {});

    const completedRides = ridesByDay.filter((r: any) => r.status === "COMPLETED");
    stats = {
      totalRides30d: ridesByDay.length,
      completedRides30d: completedRides.length,
      totalRevenue30d: Object.values(dailyPayments).reduce((a: any, b: any) => a + b, 0),
      avgRidePrice: completedRides.length > 0
        ? completedRides.reduce((a: any, b: any) => a + (b.price || 0), 0) / completedRides.length
        : 0,
      topDrivers: topDrivers.map((d: any) => ({
        id: d.id,
        name: d.user.name || "İsimsiz",
        phone: d.user.phone,
        rideCount: d._count.rides,
      })),
      topCustomers: topCustomers.map((c: any) => ({
        id: c.id,
        name: c.name || "İsimsiz",
        rideCount: c._count.rideRequests,
      })),
      vehicleBrands: vehicleStats.map((v: any) => ({
        brand: v.brand,
        count: v._count,
      })),
      dailyRides: Object.entries(dailyRides).map(([date, data]: [string, any]) => ({
        date,
        ...data,
      })),
      dailyRevenue: Object.entries(dailyPayments).map(([date, amount]: [string, any]) => ({
        date,
        amount,
      })),
    };
  } catch (e) {
    // Database not available, use default stats
  }

  return <AnalyticsDashboard stats={stats} />;
}
