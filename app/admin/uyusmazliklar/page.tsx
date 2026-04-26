import { prisma } from "@/lib/db";
import { DisputeManagement } from "./_components/dispute-management";

export const dynamic = "force-dynamic";

export default async function DisputesPage() {
  const disputes = await prisma.dispute.findMany({
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

  const stats = await prisma.dispute.groupBy({
    by: ["status"],
    _count: true,
  });

  return (
    <DisputeManagement
      disputes={JSON.parse(JSON.stringify(disputes))}
      stats={JSON.parse(JSON.stringify(stats))}
    />
  );
}