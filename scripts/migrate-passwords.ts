// Migration script: Eski formatlı şifreleri bcrypt'e çevir
// Çalıştır: npx ts-node scripts/migrate-passwords.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function migratePasswords() {
  console.log('[Migration] Şifre migrasyonu başlatılıyor...');
  
  try {
    // Tüm kullanıcıları getir
    const users = await prisma.user.findMany({
      where: {
        password: {
          not: null,
        },
      },
      select: {
        id: true,
        phone: true,
        password: true,
      },
    });
    
    console.log(`[Migration] Toplam ${users.length} kullanıcı bulundu`);
    
    let migrated = 0;
    let alreadyBcrypt = 0;
    let skipped = 0;
    
    for (const user of users) {
      if (!user.password) continue;
      
      // bcrypt hash kontrolü
      if (user.password.startsWith('$2')) {
        alreadyBcrypt++;
        continue;
      }
      
      // Eski format - bcrypt ile hashle
      // NOT: Eski şifreyi bilmiyoruz, bu yüzden migration mümkün değil
      // Kullanıcı bir sonraki girişinde auth-options.ts otomatik çevirecek
      console.log(`[Migration] Eski format tespit edildi - Kullanıcı: ${user.id}, Telefon: ${user.phone}`);
      skipped++;
    }
    
    console.log('\n[Migration] Özet:');
    console.log(`- Zaten bcrypt: ${alreadyBcrypt}`);
    console.log(`- Eski format (girişte otomatik çevrilecek): ${skipped}`);
    console.log(`- Toplam: ${users.length}`);
    
  } catch (error) {
    console.error('[Migration] Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migratePasswords();
