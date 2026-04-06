import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DriverProfilePage } from "./_components/driver-profile-page";

export default async function DriverProfilPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/giris");
  }

  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      driver: true
    }
  });

  if (!user) {
    redirect("/giris");
  }

  return <DriverProfilePage user={user} />;
}
