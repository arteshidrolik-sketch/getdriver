import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { DriverNav } from "./_components/driver-nav";

export default async function DriverLayout({
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
  if (role !== "DRIVER") {
    redirect("/musteri");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DriverNav user={session.user as any} />
      <main className="pb-20 md:pb-8">{children}</main>
    </div>
  );
}