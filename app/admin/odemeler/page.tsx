import { PaymentManagement } from "./_components/payment-management";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  let payments: any[] = [];
  let stats = {
    totalPayments: 0,
    totalAmount: 0,
  };

  try {
    const { prisma } = await import("@/lib/db");
    const [dbPayments, revenueSummary] = await Promise.all([
      prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          ride: { select: { id: true, price: true } },
        },
      }),
      prisma.payment.aggregate({
        _count: true,
        _sum: { amount: true },
        where: { status: "COMPLETED" },
      }),
    ]);
    payments = JSON.parse(JSON.stringify(dbPayments));
    stats = {
      totalPayments: revenueSummary._count || 0,
      totalAmount: revenueSummary._sum.amount || 0,
    };
  } catch (e) {
    // Database not available
  }

  return (
    <PaymentManagement
      payments={payments}
      stats={stats}
    />
  );
}
