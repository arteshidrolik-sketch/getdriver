import { prisma } from "@/lib/db";
import { AdminDashboard } from "./_components/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [
    totalUsers,
    totalDrivers,
    pendingDrivers,
    totalRides,
    completedRides,
    activeRequests,
    openDisputes,
    openTickets,
    revenueData,
    recentRides,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.driver.count(),
    prisma.driver.count({ where: { approvalStatus: "PENDING" } }),
    prisma.ride.count(),
    prisma.ride.count({ where: { status: "COMPLETED" } }),
    prisma.rideRequest.count({ where: { status: "ACTIVE" } }),
    prisma.dispute.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
    prisma.supportTicket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.ride.aggregate({
      where: { status: "COMPLETED" },
      _sum: { price: true, platformFee: true },
    }),
    prisma.ride.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        request: {
          include: { customer: true, vehicle: true },
        },
        driver: { include: { user: true } },
      },
    }),
  ]);

  const stats = {
    totalUsers,
    totalDrivers,
    pendingDrivers,
    totalRides,
    completedRides,
    totalRevenue: revenueData._sum.price || 0,
    platformRevenue: revenueData._sum.platformFee || 0,
    activeRequests,
    openDisputes,
    openTickets,
  };

  return (
    <AdminDashboard
      stats={stats}
      recentRides={JSON.parse(JSON.stringify(recentRides))}
    />
  );
}