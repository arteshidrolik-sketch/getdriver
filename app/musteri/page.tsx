import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { CustomerDashboard } from "./_components/customer-dashboard";

export const dynamic = "force-dynamic";

export default async function CustomerHomePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const [activeRequests, activeRide, vehicles] = await Promise.all([
    prisma.rideRequest.findMany({
      where: {
        customerId: userId,
        status: { in: ["ACTIVE", "ACCEPTED"] },
      },
      include: {
        vehicle: true,
        offers: {
          include: {
            driver: {
              include: { user: true },
            },
          },
          where: { status: "PENDING" },
        },
        ride: {
          include: {
            driver: { include: { user: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.ride.findFirst({
      where: {
        request: { customerId: userId },
        status: { in: ["PENDING_PICKUP", "DRIVER_ARRIVED", "PHOTOS_BEFORE", "IN_PROGRESS", "PHOTOS_AFTER"] },
      },
      include: {
        request: { include: { vehicle: true } },
        driver: { include: { user: true } },
        photos: true,
      },
    }),
    prisma.vehicle.findMany({
      where: { userId },
    }),
  ]);

  return (
    <CustomerDashboard
      userName={(session?.user as any)?.name || ""}
      activeRequests={JSON.parse(JSON.stringify(activeRequests))}
      activeRide={activeRide ? JSON.parse(JSON.stringify(activeRide)) : null}
      vehicleCount={vehicles.length}
    />
  );
}