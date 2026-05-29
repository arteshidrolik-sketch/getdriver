'use client';

import { CustomerDashboard } from "./_components/customer-dashboard";

export default function CustomerHomePage() {
  return (
    <CustomerDashboard
      userName=""
      activeRequests={[]}
      activeRide={null}
      vehicleCount={0}
    />
  );
}
