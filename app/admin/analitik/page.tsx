import { prisma } from "@/lib/db";
import { AnalyticsDashboard } from "./_components/analytics-dashboard";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  // Get stats for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    ridesByDay,
    revenueByDay,
    topDrivers,
    topCustomers,
    vehicleStats,
  ] = await Promise.all([
    // Rides per day
    prisma.ride.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: {
        createdAt: true,
        status: true,
        price: true,
      },
    }),
    // Revenue by day
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
    // Top drivers by rides
    prisma.driver.findMany({
      take: 10,
      orderBy: { rides: { _count: "desc" } },
      include: {
        user: { select: { name: true, phone: true } },
        _count: { select: { rides: true } },
      },
    }),
    // Top customers by rides
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      take: 10,
      orderBy: { rideRequests: { _count: "desc" } },
      include: {
        _count: { select: { rideRequests: true } },
      },
    }),
    // Vehicle statistics
    prisma.vehicle.groupBy({
      by: ["brand"],
      _count: true,
    }),
  ]);

  // Process daily data
  const dailyRides = ridesByDay.reduce((acc, ride) => {
    const day = ride.createdAt.toISOString().split("T")[0];
    if (!acc[day]) acc[day] = { total: 0, completed: 0, revenue: 0 };
    acc[day].total++;
    if (ride.status === "COMPLETED") {
      acc[day].completed++;
      acc[day].revenue += ride.price || 0;
    }
    return acc;
  }, {} as Record<string, { total: number; completed: number; revenue: number }>);

  const dailyPayments = revenueByDay.reduce((acc, payment) => {
    const day = payment.createdAt.toISOString().split("T")[0];
    if (!acc[day]) acc[day] = 0;
    acc[day] += payment.amount || 0;
    return acc;
  }, {} as Record<string, number>);

  const stats = {
    totalRides30d: ridesByDay.length,
    completedRides30d: ridesByDay.filter((r) => r.status === "COMPLETED").length,
    totalRevenue30d: Object.values(dailyPayments).reduce((a, b) => a + b, 0),
    avgRidePrice: ridesByDay.length > 0 
      ? ridesByDay.filter((r) => r.status === "COMPLETED").reduce((a, b) => a + (b.price || 0), 0) / 
        ridesByDay.filter((r) => r.status === "COMPLETED").length 
      : 0,
    topDrivers: topDrivers.map((d) => ({
      id: d.id,
      name: d.user.name || "İsimsiz",
      phone: d.user.phone,
      rideCount: d._count.rides,
    })),
    topCustomers: topCustomers.map((c) => ({
      id: c.id,
      name: c.name || "İsimsiz",
      rideCount: c._count.rideRequests,
    })),
    vehicleBrands: vehicleStats.map((v) => ({
      brand: v.brand,
      count: v._count,
    })),
    dailyRides: Object.entries(dailyRides).map(([date, data]) => ({
      date,
      ...data,
    })),
    dailyRevenue: Object.entries(dailyPayments).map(([date, amount]) => ({
      date,
      amount,
    })),
  };

  return <AnalyticsDashboard stats={stats} />;
}