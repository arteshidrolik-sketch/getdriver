import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { CustomerNav } from "./_components/customer-nav";
import { SOSButton } from "@/components/sos-button";
import { PushNotificationManager } from "@/components/push-notification-manager";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/giris");
  }

  const role = (session.user as any)?.role;
  if (role === "ADMIN") {
    redirect("/admin");
  }
  if (role === "DRIVER") {
    redirect("/surucu");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <CustomerNav user={session.user as any} />
      <main className="pb-20 md:pb-8">{children}</main>
      <SOSButton />
      <PushNotificationManager />
    </div>
  );
}