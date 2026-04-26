import { prisma } from "@/lib/db";
import { UserManagement } from "./_components/user-management";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const [customers, drivers, admins] = await Promise.all([
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.user.findMany({
      where: { role: "DRIVER" },
      include: { driver: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.user.findMany({
      where: { role: "ADMIN" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <UserManagement
      customers={JSON.parse(JSON.stringify(customers))}
      drivers={JSON.parse(JSON.stringify(drivers))}
      admins={JSON.parse(JSON.stringify(admins))}
    />
  );
}