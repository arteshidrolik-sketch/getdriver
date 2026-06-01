import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { ProfilePage } from "./_components/profile-page";

export const dynamic = "force-dynamic";

export default async function CustomerProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      vehicles: true,
      addresses: true,
      paymentMethods: true,
    },
  });

  return <ProfilePage user={JSON.parse(JSON.stringify(user))} />;
}