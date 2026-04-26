import { prisma } from "@/lib/db";
import { PaymentManagement } from "./_components/payment-management";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const [payments, revenueSummary] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { name: true, phone: true } },
        ride: { select: { id: true, price: true } },
      },
    }),
    prisma.payment.aggregate({
      _count: true,
      _sum: { amount: true },
      where: { status: "COMPLETED" },
    }),
    prisma.ride.aggregate({
      _sum: { price: true, platformFee: true },
      where: { status: "COMPLETED" },
    }),
  ]);

  const stats = {
    totalPayments: revenueSummary._count || 0,
    totalAmount: revenueSummary._sum.amount || 0,
  };

  return (
    <PaymentManagement
      payments={JSON.parse(JSON.stringify(payments))}
      stats={stats}
    />
  );
}