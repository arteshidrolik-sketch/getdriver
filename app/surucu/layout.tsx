'use client';

import { DriverNav } from "./_components/driver-nav";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DriverNav user={{ name: "", image: null, role: "DRIVER" }} />
      <main className="pb-20 md:pb-8">{children}</main>
    </div>
  );
}
