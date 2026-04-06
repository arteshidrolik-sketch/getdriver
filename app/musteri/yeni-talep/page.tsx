import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { NewRequestForm } from "./_components/new-request-form";

export const dynamic = "force-dynamic";

export default async function NewRequestPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const [vehicles, addresses, paymentMethods] = await Promise.all([
    prisma.vehicle.findMany({
      where: { userId },
      orderBy: { isDefault: "desc" },
    }),
    prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: "desc" },
    }),
    prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: { isDefault: "desc" },
    }),
  ]);

  if (vehicles.length === 0) {
    redirect("/musteri/profil/araclarim?redirect=yeni-talep");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Yeni Sürüş Talebi</h1>
      <NewRequestForm
        vehicles={JSON.parse(JSON.stringify(vehicles))}
        savedAddresses={JSON.parse(JSON.stringify(addresses))}
        paymentMethods={JSON.parse(JSON.stringify(paymentMethods))}
      />
    </div>
  );
}