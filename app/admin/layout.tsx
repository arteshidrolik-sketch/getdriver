import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { AdminNav } from "./_components/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/giris");
  }

  const role = (session.user as any)?.role;
  if (role !== "ADMIN") {
    if (role === "DRIVER") {
      redirect("/surucu");
    }
    redirect("/musteri");
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <AdminNav user={session.user as any} />
      <main className="md:ml-64 p-4 md:p-8">{children}</main>
    </div>
  );
}