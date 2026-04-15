# GetDriver İki Taraflı Test Raporu

**Tarih:** 15 Nisan 2026  
**Uygulama:** GetDriver  
**URL:** https://getdriver-qnhegql34-arteshidrolik-sketchs-projects.vercel.app

---

## 📊 Genel Durum

| Kontrol | Durum |
|---------|-------|
| Uygulama Erişilebilirliği | ✅ Çalışıyor (HTTP 200) |
| Ana Sayfa | ✅ Aktif |
| Kayıt Sayfaları | ✅ Aktif |
| API Endpoint | ⚠️ Kısmen (Detaylı test gerekli) |
| Veritabanı Bağlantısı | ⚠️ Kontrol edilmedi |

---

## 🧪 Test Senaryoları

### 1. Müşteri (Yolcu) Kayıt Testi

**Test Adımları:**
1. `/kayit` sayfasına git
2. Telefon numarası gir: `5551234567`
3. Ad soyad gir: `Test Musteri`
4. Şifre oluştur: `Test1234!` (8+ karakter, büyük/küçük harf, rakam)
5. "Kayıt Ol" butonuna tıkla

**Beklenen Sonuç:**
- ✅ Kayıt başarılı mesajı
- ✅ Otomatik giriş
- ✅ `/musteri` paneline yönlendirme

**Not:** API testinde veritabanı hatası alındı. Vercel deploy'unda veritabanı şeması güncel olmayabilir.

---

### 2. Sürücü Kayıt Testi

**Test Adımları:**
1. `/surucu-ol` sayfasına git
2. Telefon numarası gir: `5559876543`
3. Ad soyad gir: `Test Surucu`
4. Şifre oluştur: `Test1234!`
5. "Devam Et" butonuna tıkla
6. Belgeleri yükle:
   - Ehliyet fotoğrafı (zorunlu)
   - Profil fotoğrafı (opsiyonel)
   - Adli sicil kaydı (zorunlu)
7. Adli sicil beyanını onayla
8. "Başvuruyu Gönder" butonuna tıkla

**Beklenen Sonuç:**
- ✅ Başvuru alındı mesajı
- ✅ Sürücü kaydı oluşturulur (PENDING durumunda)
- ✅ Belgeler S3'e yüklenir

**Not:** API testinde veritabanı hatası alındı.

---

### 3. Giriş Testi

**Test Adımları:**
1. `/giris` sayfasına git
2. Telefon ve şifre ile giriş yap
3. Rol bazlı yönlendirme kontrolü

**Beklenen Sonuç:**
- ✅ Müşteri → `/musteri`
- ✅ Sürücü → `/surucu`

---

## ⚠️ Tespit Edilen Sorunlar

### 1. Veritabanı Bağlantısı
API testlerinde kayıt işlemi başarısız oldu. Muhtemel nedenler:
- Vercel'de Prisma migrate çalıştırılmamış
- DATABASE_URL ortam değişkeni eksik/hatalı
- Neon PostgreSQL bağlantı limiti

**Çözüm Önerisi:**
```bash
# Vercel CLI ile migrate çalıştır
vercel --prod
npx prisma migrate deploy
```

### 2. Test Dosyaları
Manuel test için sahte belgeler oluşturuldu:
- `/tmp/getdriver-test/ehliyet.jpg`
- `/tmp/getdriver-test/profil.jpg`
- `/tmp/getdriver-test/adli_sicil.jpg`

---

## 📋 Manuel Test Talimatları

### Hızlı Test Rehberi

**Müşteri Kaydı:**
```
URL: https://getdriver-qnhegql34-arteshidrolik-sketchs-projects.vercel.app/kayit
Telefon: 5551112233
Ad: Test Musteri
Şifre: Test1234!
```

**Sürücü Kaydı:**
```
URL: https://getdriver-qnhegql34-arteshidrolik-sketchs-projects.vercel.app/surucu-ol
Telefon: 5554445566
Ad: Test Surucu
Şifre: Test1234!
Belgeler: Yukarıdaki test dosyalarını kullan
```

---

## 🔧 Teknik Detaylar

### API Endpoint'ler
- `POST /api/signup` - Kayıt işlemi
- `POST /api/auth/callback/credentials` - Giriş işlemi
- `PUT /api/driver/profile` - Sürücü profil güncelleme
- `POST /api/upload/presigned` - Dosya yükleme URL'i alma

### Veritabanı Şeması
- PostgreSQL (Neon)
- Prisma ORM
- Tablolar: User, Driver, Vehicle, RideRequest, Ride, vb.

---

## ✅ Sonuç

Uygulama frontend olarak çalışıyor ancak kayıt API'sinde veritabanı sorunu var. Manuel test için:

1. Önce veritabanı migrate edilmeli
2. Manuel test için tarayıcıda kayıt sayfaları açılmalı
3. Test verileriyle kayıt denenmeli

**Durum:** Test için hazır, veritabanı migrate edildikten sonra tam test yapılabilir.

---

*Raporu hazırlayan: Emre (GetDriver Bilgi İşlem)*  
*Onaylayan: Makbule (Yönetici Asistan)*
