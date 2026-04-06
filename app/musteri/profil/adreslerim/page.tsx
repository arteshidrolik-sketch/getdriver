import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { AddressesPage } from "./_components/addresses-page";

export default async function MyAddressesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/giris");
  }

  const userId = (session.user as any).id;
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { isDefault: "desc" },
  });

  return <AddressesPage addresses={addresses} />;
}
