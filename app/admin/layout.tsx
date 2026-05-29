'use client';

import { AdminNav } from "./_components/admin-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <AdminNav user={{ name: "Admin" }} />
      <main className="md:ml-64 p-4 md:p-8">{children}</main>
    </div>
  );
}
