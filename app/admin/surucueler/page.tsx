import { prisma } from "@/lib/db";
import { DriverManagement } from "./_components/driver-management";

export const dynamic = "force-dynamic";

export default async function DriversPage() {
  const drivers = await prisma.driver.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, phone: true, email: true, status: true, createdAt: true } },
      vehicle: true,
      _count: { select: { rides: true } },
    },
  });

  return (
    <DriverManagement
      drivers={JSON.parse(JSON.stringify(drivers))}
    />
  );
}