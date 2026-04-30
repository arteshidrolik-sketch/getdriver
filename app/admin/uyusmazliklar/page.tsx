import { DisputeManagement } from "./_components/dispute-management";

export const dynamic = "force-dynamic";

export default async function DisputesPage() {
  let disputes: any[] = [];
  let stats: any[] = [];

  try {
    const { prisma } = await import("@/lib/db");
    disputes = await prisma.dispute.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        ride: {
          include: {
            request: {
              include: {
                customer: { select: { name: true, phone: true } },
              },
            },
            driver: { include: { user: { select: { name: true, phone: true } } } },
          },
        },
      },
    });
    stats = await prisma.dispute.groupBy({
      by: ["status"],
      _count: true,
    });
    disputes = JSON.parse(JSON.stringify(disputes));
    stats = JSON.parse(JSON.stringify(stats));
  } catch (e) {
    // Database not available
  }

  return (
    <DisputeManagement
      disputes={disputes}
      stats={stats}
    />
  );
}
