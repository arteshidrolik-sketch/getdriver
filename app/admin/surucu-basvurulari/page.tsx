import { DriverApplicationsList } from "./_components/driver-applications-list";

export const dynamic = "force-dynamic";

export default async function DriverApplicationsPage() {
  let pendingDrivers: any[] = [];

  try {
    const { prisma } = await import("@/lib/db");
    pendingDrivers = await prisma.driver.findMany({
      where: { approvalStatus: "PENDING" },
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });
    pendingDrivers = JSON.parse(JSON.stringify(pendingDrivers));
  } catch (e) {
    // Database not available
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sürücü Başvuruları</h1>
        <p className="text-muted-foreground">Onay bekleyen sürücü başvurularını inceleyin</p>
      </div>

      <DriverApplicationsList drivers={pendingDrivers} />
    </div>
  );
}
