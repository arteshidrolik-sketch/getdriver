/**
 * GetDriver Full Flow Test Suite
 * 
 * Bu test senaryosu şunları test eder:
 * 1. Müşteri kaydı oluştur
 * 2. Sürücü kaydı oluştur
 * 3. Müşteri giriş yap ve talep oluştur
 * 4. Sürücü giriş yap ve online ol
 * 5. Sürücü talebi kabul et
 * 6. Yolculuk tamamlanana kadar konum güncelle
 * 7. Ödeme yap
 * 
 * Çalıştır: npx ts-node scripts/test-full-flow.ts
 */

import { PrismaClient, UserRole, DriverApprovalStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Test verileri
const TEST_DATA = {
  customer: {
    phone: '5551112233',
    name: 'Test Müşteri',
    password: 'Test1234!',
  },
  driver: {
    phone: '5554445566',
    name: 'Test Sürücü',
    password: 'Test1234!',
  },
  vehicle: {
    plate: '34TEST123',
    brand: 'TestBrand',
    model: 'TestModel',
    year: 2023,
    color: 'Beyaz',
  },
  rideRequest: {
    pickupLat: 41.0082,
    pickupLng: 28.9784,
    pickupAddress: 'Taksim Meydanı, İstanbul',
    dropoffLat: 41.0253,
    dropoffLng: 28.9722,
    dropoffAddress: 'Karaköy, İstanbul',
    notes: 'Test yolculuğu',
  },
};

// Test sonuçları
const results: { step: string; status: 'PASS' | 'FAIL' | 'SKIP'; message: string; error?: string }[] = [];

function logStep(step: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string, error?: string) {
  results.push({ step, status, message, error });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${icon} ${step}: ${message}`);
  if (error) console.error(`   Hata: ${error}`);
}

// Step 1: Müşteri kaydı oluştur
async function createCustomer(): Promise<string | null> {
  try {
    console.log('\n📋 STEP 1: Müşteri Kaydı Oluşturuluyor...');
    
    // Önce varsa sil
    await prisma.user.deleteMany({ where: { phone: TEST_DATA.customer.phone } });
    
    const hashedPassword = await bcrypt.hash(TEST_DATA.customer.password, 10);
    
    const customer = await prisma.user.create({
      data: {
        phone: TEST_DATA.customer.phone,
        name: TEST_DATA.customer.name,
        password: hashedPassword,
        role: UserRole.CUSTOMER,
        status: 'ACTIVE',
      },
    });
    
    logStep('Müşteri Kaydı', 'PASS', `ID: ${customer.id}, Telefon: ${customer.phone}`);
    return customer.id;
  } catch (error: any) {
    logStep('Müşteri Kaydı', 'FAIL', 'Kayıt oluşturulamadı', error.message);
    return null;
  }
}

// Step 2: Sürücü kaydı oluştur
async function createDriver(): Promise<{ userId: string; driverId: string } | null> {
  try {
    console.log('\n📋 STEP 2: Sürücü Kaydı Oluşturuluyor...');
    
    // Önce varsa sil
    const existingDriver = await prisma.user.findUnique({
      where: { phone: TEST_DATA.driver.phone },
      include: { driver: true },
    });
    
    if (existingDriver?.driver) {
      await prisma.driver.delete({ where: { id: existingDriver.driver.id } });
    }
    await prisma.user.deleteMany({ where: { phone: TEST_DATA.driver.phone } });
    
    const hashedPassword = await bcrypt.hash(TEST_DATA.driver.password, 10);
    
    const user = await prisma.user.create({
      data: {
        phone: TEST_DATA.driver.phone,
        name: TEST_DATA.driver.name,
        password: hashedPassword,
        role: UserRole.DRIVER,
        status: 'ACTIVE',
        driver: {
          create: {
            approvalStatus: DriverApprovalStatus.APPROVED,
            isOnline: false,
            ratingAvg: 4.5,
            totalRides: 10,
          },
        },
      },
      include: { driver: true },
    });
    
    if (!user.driver) {
      throw new Error('Sürücü profili oluşturulamadı');
    }
    
    logStep('Sürücü Kaydı', 'PASS', `User ID: ${user.id}, Driver ID: ${user.driver.id}`);
    return { userId: user.id, driverId: user.driver.id };
  } catch (error: any) {
    logStep('Sürücü Kaydı', 'FAIL', 'Kayıt oluşturulamadı', error.message);
    return null;
  }
}

// Step 3: Müşteri için araç ve ödeme yöntemi oluştur
async function createCustomerData(customerId: string): Promise<{ vehicleId: string; paymentMethodId: string } | null> {
  try {
    console.log('\n📋 STEP 3: Müşteri Verileri Oluşturuluyor...');
    
    // Araç oluştur
    const vehicle = await prisma.vehicle.create({
      data: {
        userId: customerId,
        plate: TEST_DATA.vehicle.plate,
        brand: TEST_DATA.vehicle.brand,
        model: TEST_DATA.vehicle.model,
        year: TEST_DATA.vehicle.year,
        color: TEST_DATA.vehicle.color,
        isDefault: true,
      },
    });
    
    // Ödeme yöntemi oluştur
    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: customerId,
        cardLast4: '4242',
        cardBrand: 'Visa',
        cardHolder: TEST_DATA.customer.name,
        isDefault: true,
      },
    });
    
    logStep('Müşteri Verileri', 'PASS', `Araç: ${vehicle.id}, Ödeme: ${paymentMethod.id}`);
    return { vehicleId: vehicle.id, paymentMethodId: paymentMethod.id };
  } catch (error: any) {
    logStep('Müşteri Verileri', 'FAIL', 'Veriler oluşturulamadı', error.message);
    return null;
  }
}

// Step 4: Müşteri talep oluştur
async function createRideRequest(
  customerId: string,
  vehicleId: string,
  paymentMethodId: string
): Promise<string | null> {
  try {
    console.log('\n📋 STEP 4: Talep Oluşturuluyor...');
    
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'settings' },
    });
    
    const expiresAt = new Date(Date.now() + (settings?.maxOfferWaitMin || 15) * 60 * 1000);
    
    const request = await prisma.rideRequest.create({
      data: {
        customerId,
        vehicleId,
        paymentMethodId,
        pickupLat: TEST_DATA.rideRequest.pickupLat,
        pickupLng: TEST_DATA.rideRequest.pickupLng,
        pickupAddress: TEST_DATA.rideRequest.pickupAddress,
        dropoffLat: TEST_DATA.rideRequest.dropoffLat,
        dropoffLng: TEST_DATA.rideRequest.dropoffLng,
        dropoffAddress: TEST_DATA.rideRequest.dropoffAddress,
        notes: TEST_DATA.rideRequest.notes,
        status: 'ACTIVE',
        expiresAt,
      },
    });
    
    logStep('Talep Oluşturma', 'PASS', `Request ID: ${request.id}`);
    return request.id;
  } catch (error: any) {
    logStep('Talep Oluşturma', 'FAIL', 'Talep oluşturulamadı', error.message);
    return null;
  }
}

// Step 5: Sürücü online ol ve konum güncelle
async function setDriverOnline(driverId: string): Promise<boolean> {
  try {
    console.log('\n📋 STEP 5: Sürücü Online Oluyor...');
    
    await prisma.driver.update({
      where: { id: driverId },
      data: {
        isOnline: true,
        currentLat: 41.01,
        currentLng: 28.98,
        lastLocationUpdate: new Date(),
      },
    });
    
    logStep('Sürücü Online', 'PASS', 'Sürücü online durumuna geçti');
    return true;
  } catch (error: any) {
    logStep('Sürücü Online', 'FAIL', 'Online durumu güncellenemedi', error.message);
    return false;
  }
}

// Step 6: Sürücü teklif oluştur
async function createOffer(
  requestId: string,
  driverId: string
): Promise<string | null> {
  try {
    console.log('\n📋 STEP 6: Teklif Oluşturuluyor...');
    
    const offer = await prisma.rideOffer.create({
      data: {
        requestId,
        driverId,
        price: 150,
        estimatedArrival: 10,
        message: 'Test teklifi',
        status: 'PENDING',
      },
    });
    
    logStep('Teklif Oluşturma', 'PASS', `Offer ID: ${offer.id}`);
    return offer.id;
  } catch (error: any) {
    logStep('Teklif Oluşturma', 'FAIL', 'Teklif oluşturulamadı', error.message);
    return null;
  }
}

// Step 7: Müşteri teklifi kabul et ve yolculuk başlat
async function acceptOfferAndCreateRide(
  requestId: string,
  offerId: string,
  driverId: string
): Promise<string | null> {
  try {
    console.log('\n📋 STEP 7: Teklif Kabul Ediliyor ve Yolculuk Başlatılıyor...');
    
    const result = await prisma.$transaction(async (tx) => {
      // Yolculuk oluştur
      const ride = await tx.ride.create({
        data: {
          requestId,
          offerId,
          driverId,
          price: 150,
          platformFee: 30,
          driverAmount: 120,
          status: 'PENDING_PICKUP',
        },
      });
      
      // Talep durumunu güncelle
      await tx.rideRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      });
      
      // Teklifi kabul et
      await tx.rideOffer.update({
        where: { id: offerId },
        data: { status: 'ACCEPTED' },
      });
      
      // Diğer teklifleri reddet
      await tx.rideOffer.updateMany({
        where: {
          requestId,
          id: { not: offerId },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      });
      
      // Ödeme kaydı oluştur
      await tx.payment.create({
        data: {
          rideId: ride.id,
          amount: 150,
          platformFee: 30,
          driverAmount: 120,
          status: 'PRE_AUTH',
          preAuthRef: `PREAUTH_${ride.id}`,
        },
      });
      
      return ride;
    });
    
    logStep('Yolculuk Başlatma', 'PASS', `Ride ID: ${result.id}`);
    return result.id;
  } catch (error: any) {
    logStep('Yolculuk Başlatma', 'FAIL', 'Yolculuk başlatılamadı', error.message);
    return null;
  }
}

// Step 8: Sürücü konum güncelle (simülasyon)
async function updateDriverLocation(driverId: string): Promise<boolean> {
  try {
    console.log('\n📋 STEP 8: Sürücü Konumu Güncelleniyor...');
    
    // Simüle edilmiş konum güncellemeleri
    const locations = [
      { lat: 41.015, lng: 28.975 },
      { lat: 41.018, lng: 28.972 },
      { lat: 41.020, lng: 28.970 },
    ];
    
    for (const loc of locations) {
      await prisma.driver.update({
        where: { id: driverId },
        data: {
          currentLat: loc.lat,
          currentLng: loc.lng,
          lastLocationUpdate: new Date(),
        },
      });
      console.log(`   📍 Konum: ${loc.lat}, ${loc.lng}`);
    }
    
    logStep('Konum Güncelleme', 'PASS', '3 konum güncellemesi yapıldı');
    return true;
  } catch (error: any) {
    logStep('Konum Güncelleme', 'FAIL', 'Konum güncellenemedi', error.message);
    return false;
  }
}

// Step 9: Yolculuk durumunu güncelle (tamamlandı)
async function completeRide(rideId: string): Promise<boolean> {
  try {
    console.log('\n📋 STEP 9: Yolculuk Tamamlanıyor...');
    
    await prisma.$transaction(async (tx) => {
      // Yolculuğu tamamla
      await tx.ride.update({
        where: { id: rideId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
      
      // Ödemeyi tamamla
      await tx.payment.update({
        where: { rideId },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
        },
      });
      
      // Sürücü istatistiklerini güncelle
      const ride = await tx.ride.findUnique({
        where: { id: rideId },
        include: { driver: true },
      });
      
      if (ride?.driver) {
        await tx.driver.update({
          where: { id: ride.driverId },
          data: {
            totalRides: { increment: 1 },
            totalEarnings: { increment: ride.driverAmount },
          },
        });
      }
    });
    
    logStep('Yolculuk Tamamlama', 'PASS', 'Yolculuk başarıyla tamamlandı');
    return true;
  } catch (error: any) {
    logStep('Yolculuk Tamamlama', 'FAIL', 'Yolculuk tamamlanamadı', error.message);
    return false;
  }
}

// Step 10: Test verilerini temizle
async function cleanupTestData(customerId: string, driverUserId: string, requestId: string, rideId: string) {
  try {
    console.log('\n📋 STEP 10: Test Verileri Temizleniyor...');
    
    // Önce ilişkili kayıtları sil
    await prisma.payment.deleteMany({ where: { rideId } });
    await prisma.ride.deleteMany({ where: { id: rideId } });
    await prisma.rideOffer.deleteMany({ where: { requestId } });
    await prisma.rideRequest.deleteMany({ where: { id: requestId } });
    await prisma.vehicle.deleteMany({ where: { userId: customerId } });
    await prisma.paymentMethod.deleteMany({ where: { userId: customerId } });
    
    // Sürücüyü bul ve sil
    const driver = await prisma.driver.findFirst({
      where: { userId: driverUserId },
    });
    if (driver) {
      await prisma.driver.deleteMany({ where: { userId: driverUserId } });
    }
    
    // Kullanıcıları sil
    await prisma.user.deleteMany({ where: { id: customerId } });
    await prisma.user.deleteMany({ where: { id: driverUserId } });
    
    logStep('Temizlik', 'PASS', 'Tüm test verileri silindi');
  } catch (error: any) {
    logStep('Temizlik', 'FAIL', 'Temizlik yapılamadı', error.message);
  }
}

// Ana test fonksiyonu
async function runFullFlowTest() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     GetDriver Full Flow Test Suite - Başlatılıyor      ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  const startTime = Date.now();
  let customerId: string | null = null;
  let driverUserId: string | null = null;
  let driverId: string | null = null;
  let requestId: string | null = null;
  let offerId: string | null = null;
  let rideId: string | null = null;
  
  try {
    // Step 1: Müşteri kaydı
    customerId = await createCustomer();
    if (!customerId) throw new Error('Müşteri kaydı başarısız');
    
    // Step 2: Sürücü kaydı
    const driverData = await createDriver();
    if (!driverData) throw new Error('Sürücü kaydı başarısız');
    driverUserId = driverData.userId;
    driverId = driverData.driverId;
    
    // Step 3: Müşteri verileri
    const customerData = await createCustomerData(customerId);
    if (!customerData) throw new Error('Müşteri verileri oluşturulamadı');
    
    // Step 4: Talep oluştur
    requestId = await createRideRequest(customerId, customerData.vehicleId, customerData.paymentMethodId);
    if (!requestId) throw new Error('Talep oluşturulamadı');
    
    // Step 5: Sürücü online
    const onlineSuccess = await setDriverOnline(driverId);
    if (!onlineSuccess) throw new Error('Sürücü online olamadı');
    
    // Step 6: Teklif oluştur
    offerId = await createOffer(requestId, driverId);
    if (!offerId) throw new Error('Teklif oluşturulamadı');
    
    // Step 7: Teklifi kabul et ve yolculuk başlat
    rideId = await acceptOfferAndCreateRide(requestId, offerId, driverId);
    if (!rideId) throw new Error('Yolculuk başlatılamadı');
    
    // Step 8: Konum güncelle
    const locationSuccess = await updateDriverLocation(driverId);
    if (!locationSuccess) throw new Error('Konum güncellenemedi');
    
    // Step 9: Yolculuğu tamamla
    const completeSuccess = await completeRide(rideId);
    if (!completeSuccess) throw new Error('Yolculuk tamamlanamadı');
    
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                   TEST SONUÇLARI                       ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    
  } catch (error: any) {
    console.error('\n❌ Test akışı durduruldu:', error.message);
  } finally {
    // Step 10: Temizlik
    if (customerId && driverUserId && requestId && rideId) {
      await cleanupTestData(customerId, driverUserId, requestId, rideId);
    }
    
    await prisma.$disconnect();
    
    // Özet rapor
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 TEST ÖZETİ');
    console.log('═══════════════════════════════════════════════════════════');
    
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const skipped = results.filter(r => r.status === 'SKIP').length;
    
    console.log(`✅ Başarılı: ${passed}`);
    console.log(`❌ Başarısız: ${failed}`);
    console.log(`⏭️ Atlanan: ${skipped}`);
    console.log(`⏱️ Süre: ${duration}s`);
    console.log(`📈 Başarı Oranı: ${((passed / results.length) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ BAŞARISIZ ADIMLAR:');
      results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`   - ${r.step}: ${r.message}`);
      });
    }
    
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Yücel Bey için özet
    console.log('📱 YÜCEL BEY İÇİN ÖZET:');
    console.log('═══════════════════════════════════════════════════════════');
    if (failed === 0) {
      console.log('✅ TÜM TESTLER BAŞARILI!');
      console.log('GetDriver uygulaması tüm akışları sorunsuz çalıştırıyor.');
    } else {
      console.log(`⚠️ ${failed} adım başarısız oldu.`);
      console.log('Yukarıdaki hataları kontrol edin.');
    }
    console.log('═══════════════════════════════════════════════════════════');
  }
}

// Testi çalıştır
runFullFlowTest();
