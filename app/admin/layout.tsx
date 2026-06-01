import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { AdminNav } from "./_components/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // For development: bypass auth check
  const isDev = process.env.NODE_ENV === "development";
  
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (e) {
    // Auth error, continue as dev mode
  }

  // In dev mode without session, render with mock user
  if (!session?.user && isDev) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
        <AdminNav user={{ name: "Dev Admin" }} />
        <main className="md:ml-64 p-4 md:p-8">{children}</main>
      </div>
    );
  }

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
