import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { VehiclesPage } from "./_components/vehicles-page";

export const dynamic = "force-dynamic";

export default async function MyVehiclesPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const vehicles = await prisma.vehicle.findMany({
    where: { userId },
    orderBy: { isDefault: "desc" },
  });

  return <VehiclesPage vehicles={JSON.parse(JSON.stringify(vehicles))} />;
}