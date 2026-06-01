import { DriverManagement } from "./_components/driver-management";

export const dynamic = "force-dynamic";

export default async function DriversPage() {
  let drivers: any[] = [];

  try {
    const { prisma } = await import("@/lib/db");
    drivers = await prisma.driver.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true, status: true, createdAt: true } },
        vehicle: true,
        _count: { select: { rides: true } },
      },
    });
    drivers = JSON.parse(JSON.stringify(drivers));
  } catch (e) {
    // Database not available, use empty array
  }

  return (
    <DriverManagement
      drivers={drivers}
    />
  );
}
