import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { PaymentMethodsPage } from "./_components/payment-methods-page";

export default async function PaymentPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/giris");
  }

  const userId = (session.user as any).id;
  const paymentMethods = await prisma.paymentMethod.findMany({
    where: { userId },
    orderBy: { isDefault: "desc" },
  });

  return <PaymentMethodsPage paymentMethods={paymentMethods} />;
}
