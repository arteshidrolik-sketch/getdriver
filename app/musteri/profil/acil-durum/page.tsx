import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { EmergencyContactPage } from "./_components/emergency-contact-page";

export default async function EmergencyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/giris");
  }

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emergencyContact: true },
  });

  return <EmergencyContactPage emergencyContact={user?.emergencyContact || null} />;
}
