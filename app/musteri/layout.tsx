'use client';

import { CustomerNav } from "./_components/customer-nav";
import { SOSButton } from "@/components/sos-button";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <CustomerNav user={{ name: "", image: null, role: "CUSTOMER" }} />
      <main className="pb-20 md:pb-8">{children}</main>
      <SOSButton />
    </div>
  );
}
