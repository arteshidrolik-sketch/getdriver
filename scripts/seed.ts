import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create system settings
  await prisma.systemSettings.upsert({
    where: { id: "settings" },
    update: {},
    create: {
      id: "settings",
      commissionRate: 0.20,
      minFare: 100,
      maxOfferWaitMin: 15,
      supportEmail: "destek@getdriver.com",
      supportPhone: "0850 123 4567",
    },
  });

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  await prisma.user.upsert({
    where: { email: "admin@getdriver.com" },
    update: {},
    create: {
      phone: "5550000001",
      email: "admin@getdriver.com",
      password: adminPassword,
      name: "Admin",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  // Create test customer (şifre: Test1234 - güçlü şifre gereksinimleri)
  const testPassword = await bcrypt.hash("Test1234", 10);
  const testCustomer = await prisma.user.upsert({
    where: { email: "john@doe.com" },
    update: { password: testPassword, role: "CUSTOMER" },
    create: {
      phone: "5551234567",
      email: "john@doe.com",
      password: testPassword,
      name: "John Doe",
      role: "CUSTOMER",
      status: "ACTIVE",
    },
  });

  // Create test vehicle for customer
  await prisma.vehicle.upsert({
    where: { id: "test-vehicle-1" },
    update: {},
    create: {
      id: "test-vehicle-1",
      userId: testCustomer.id,
      plate: "34 ABC 123",
      brand: "Volkswagen",
      model: "Passat",
      year: 2020,
      color: "Siyah",
      isDefault: true,
    },
  });

  // Create test driver (approved)
  const driverPassword = await bcrypt.hash("Test1234", 10);
  const testDriverUser = await prisma.user.upsert({
    where: { phone: "5559876543" },
    update: { password: driverPassword },
    create: {
      phone: "5559876543",
      email: "surucu@test.com",
      password: driverPassword,
      name: "Ahmet Sürücü",
      role: "DRIVER",
      status: "ACTIVE",
    },
  });

  await prisma.driver.upsert({
    where: { userId: testDriverUser.id },
    update: {},
    create: {
      userId: testDriverUser.id,
      licensePhoto: "demo-license.jpg",
      criminalRecordDecl: true,
      licenseYears: 5,
      approvalStatus: "APPROVED",
      approvedAt: new Date(),
      isOnline: false,
      ratingAvg: 4.8,
      ratingCount: 25,
      totalRides: 50,
      totalEarnings: 7500,
    },
  });

  // Create a pending driver for testing admin approval
  const pendingDriverUser = await prisma.user.upsert({
    where: { phone: "5551112233" },
    update: {},
    create: {
      phone: "5551112233",
      email: "bekleyen@test.com",
      password: driverPassword,
      name: "Mehmet Bekleyen",
      role: "DRIVER",
      status: "ACTIVE",
    },
  });

  await prisma.driver.upsert({
    where: { userId: pendingDriverUser.id },
    update: {},
    create: {
      userId: pendingDriverUser.id,
      licensePhoto: "demo-license-2.jpg",
      criminalRecordDecl: true,
      licenseYears: 3,
      approvalStatus: "PENDING",
    },
  });

  console.log("Database seeded successfully!");
  console.log("\nTest Accounts:");
  console.log("- Admin: admin@getdriver.com / Admin123!");
  console.log("- Customer: 5551234567 / johndoe123");
  console.log("- Driver (Approved): 5559876543 / driver123");
  console.log("- Driver (Pending): 5551112233 / driver123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });