import { AdminDashboard } from "./_components/admin-dashboard";

export const dynamic = "force-dynamic";

// Mock data for development without database
const mockStats = {
  totalUsers: 0,
  totalDrivers: 0,
  pendingDrivers: 0,
  totalRides: 0,
  completedRides: 0,
  totalRevenue: 0,
  platformRevenue: 0,
  activeRequests: 0,
  openDisputes: 0,
  openTickets: 0,
};

const mockRecentRides: any[] = [];

export default async function AdminHomePage() {
  let stats = mockStats;
  let recentRides = mockRecentRides;

  try {
    const { prisma } = await import("@/lib/db");
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
      dbRecentRides,
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

    stats = {
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
    recentRides = JSON.parse(JSON.stringify(dbRecentRides));
  } catch (e) {
    // Database not available, use mock data
  }

  return (
    <AdminDashboard
      stats={stats}
      recentRides={recentRides}
    />
  );
}
