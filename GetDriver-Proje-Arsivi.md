# 🚗 GetDriver - Komple Proje Arşivi ve Geliştirme Geçmişi

> **Bu dosya nedir?** GetDriver projesinin başından sonuna kadar tüm geliştirme sürecini, yapılan hataları, çözümleri ve teknik detayları içeren kapsamlı bir arşivdir. Herhangi bir AI asistanına verildiğinde projenin tam bağlamını anlaması için hazırlanmıştır.
>
> **Son güncelleme:** 8 Haziran 2026

---

## 📋 İÇİNDEKİLER

1. [Proje Tanımı](#1-proje-tanımı)
2. [Teknik Altyapı](#2-teknik-altyapı)
3. [Proje Sahibi Bilgileri](#3-proje-sahibi-bilgileri)
4. [Kronolojik Geliştirme Günlüğü](#4-kronolojik-geliştirme-günlüğü)
5. [Yapılan Hatalar ve Çözümleri (Detaylı)](#5-yapılan-hatalar-ve-çözümleri)
6. [Tamamlanan Özellikler](#6-tamamlanan-özellikler)
7. [Android TWA Süreci](#7-android-twa-süreci)
8. [iOS Build Süreci](#8-ios-build-süreci)
9. [Play Store Yayınlama Süreci](#9-play-store-yayınlama-süreci)
10. [DNS ve Domain Yapılandırması](#10-dns-ve-domain-yapılandırması)
11. [Mevcut Durum ve Açık Konular](#11-mevcut-durum-ve-açık-konular)
12. [Önemli Dosya Konumları](#12-önemli-dosya-konumları)
13. [Hesap Bilgileri ve Erişimler](#13-hesap-bilgileri-ve-erişimler)
14. [Git Commit Geçmişi (Tam)](#14-git-commit-geçmişi)

---

## 1. PROJE TANIMI

**GetDriver**, Türkiye'nin güvenli şoför platformudur. Müşterileri profesyonel sürücülerle buluşturur. Uber/Bolt benzeri bir yapıda çalışır ancak odak noktası "güvenli gece yolculuğu" ve "kendi aracınla şoför hizmeti"dir.

- **Canlı Site:** https://www.getdriver.com.tr
- **Android Uygulaması:** com.getdriver.app (TWA - Google Play Store)
- **iOS Uygulaması:** com.getdriver.app (Capacitor - geliştirme aşamasında)
- **GitHub Repo:** https://github.com/arteshidrolik-sketch/getdriver

---

## 2. TEKNİK ALTYAPI

| Teknoloji | Kullanım |
|-----------|----------|
| **Next.js 14** | Ana framework (App Router) |
| **Prisma 6** | ORM (PostgreSQL üzerinde) |
| **PostgreSQL** | Veritabanı (Neon hosted) |
| **NextAuth.js v4** | Kimlik doğrulama (Telefon/Şifre) |
| **Tailwind CSS + Radix UI** | UI framework |
| **Google Maps API + Mapbox GL** | Harita ve konum servisleri |
| **AWS S3** | Dosya depolama |
| **Firebase Cloud Messaging (FCM)** | Push bildirimleri |
| **Web Push (VAPID)** | Web push bildirimleri |
| **İleti Merkezi** | SMS/OTP gönderimi |
| **PayTR** | Ödeme sistemi |
| **Vercel** | Hosting ve deployment |
| **Bubblewrap** | Android TWA oluşturma |
| **Capacitor** | iOS native build |
| **GitHub Actions** | iOS CI/CD pipeline |

### Veritabanı Şeması (Ana Tablolar)
- `User` — Kullanıcılar (müşteri + sürücü)
- `Driver` — Sürücü profilleri ve belgeleri
- `Vehicle` — Araç bilgileri
- `RideRequest` — Yolculuk talepleri
- `Ride` — Aktif/tamamlanan yolculuklar
- `Payment` — Ödeme kayıtları
- `Rating` — Sürücü değerlendirmeleri

---

## 3. PROJE SAHİBİ BİLGİLERİ

- **Ad:** Ali Yücel Yalçın
- **Email:** arteshidrolik@gmail.com
- **Sürücü test hesabı:** 05057157353 / Ay151819
- **Müşteri test hesabı:** 05321110001 / Test1234!
- **Alternatif email:** artessamsun@gmail.com (Play Console hesabı olabilir)

---

## 4. KRONOLOJİK GELİŞTİRME GÜNLÜĞÜ

### 🗓️ NİSAN 2026

#### 6 Nisan — Proje Başlangıcı
- İlk commit atıldı. Next.js 14 + Prisma + NextAuth altyapısı kuruldu.
- Vercel'e deploy edildi.
- **İlk sorunlar:** API route'ları statik oluşturuluyordu → `force-dynamic` eklendi.
- Google OAuth ile giriş ekranı yapıldı.

#### 7 Nisan — Auth Sorunları
- NextAuth cookie yapılandırması sorunları yaşandı.
- PrismaAdapter JWT stratejisi ile uyumsuzdu → devre dışı bırakıldı.
- Google OAuth ile ilk giriş yapan kullanıcılar otomatik oluşturulmuyordu → düzeltildi.
- `password` alanı yerine `passwordHash` kullanılıyordu → düzeltildi.

#### 8 Nisan — Google OAuth Kaldırıldı
- **Karar:** Google OAuth tamamen kaldırıldı, sadece telefon/şifre girişi kalacak.
- Sebep: OAuth akışı karmaşıktı ve Türk kullanıcılar telefon bazlı girişe daha alışkın.
- Detaylı hata mesajları eklendi (kayıt debug'ı için).

#### 9 Nisan — Kayıt (Signup) Debug
- Rate limiting kayıt işlemini engelliyordu → geçici olarak devre dışı bırakıldı.
- Hata kodları signup hata mesajlarına eklendi.
- Bağımlılıklar clean install edildi.

#### 11-13 Nisan — Google Maps Entegrasyonu
- Maps API yüklenme sorunları yaşandı.
- Auth gereksinimi harita bileşenlerini engelliyordu → kaldırıldı.
- API key component'e hardcode edildi (geçici çözüm).
- Sözdizimi hatası düzeltildi.
- Places API endpoint'lerinden auth gereksinimi kaldırıldı.
- **Kök sorun:** `GOOGLE_MAPS_API_KEY` environment variable'ı Places API endpoint'lerinde tanımlı değildi → düzeltildi.

#### 14 Nisan — Çekirdek Özellikler Tamamlandı
Tek günde büyük ilerleme kaydedildi:
- ✅ Sürücü eşleştirme algoritması
- ✅ Sürücü online/offline arayüzü
- ✅ Gerçek zamanlı sürücü takibi
- ✅ PayTR ödeme sistemi entegrasyonu
- ✅ Şifremi unuttum özelliği
- ✅ Eski kullanıcıların giriş sorunu çözüldü

#### 15 Nisan — Test ve Rezervasyon
- End-to-end test suite eklendi.
- Önceden rezervasyon özelliği tamamlandı.
- Rezervasyon iptal ve no-show kuralları eklendi.

#### 16 Nisan
- Sürücü başvuru API'si düzeltildi.

#### 20-21 Nisan — Sürücü Paneli ve Admin İyileştirmeleri
- Sürücü tarafında gereksiz kabul/red butonları kaldırıldı (sadece müşteri tarafında kalacak).
- Sürücü dashboard'da birden fazla aktif yolculuk gösterilmeye başlandı (limit: 1 → 10).
- Kayıt sırasında konum, kamera ve bildirim izinleri isteniyor.
- Admin panelde Excel export eklendi.
- **Beyaz ekran hatası:** Permission hook'taki toast bağımlılığı beyaz ekrana neden oluyordu → kaldırıldı.
- **Beyaz ekran hatası (2):** Permission request sayfası beyaz ekran veriyordu → otomatik yönlendirme eklendi.
- Telefon formatı düzeltildi: `0(XXX) XXX XX XX` formatı.
- Telefon input'u sadece rakam, 10 hane olarak sınırlandırıldı.
- Kayıt sonrası yönlendirme düzeltildi.
- İzinler sayfası her zaman gösterilecek şekilde ayarlandı.
- **Tasarım değişikliği:** İzinler kayıt sırasında değil, özellik kullanılırken istenecek (daha iyi UX).

#### 24 Nisan
- Konum alırken reverse geocode artık API üzerinden yapılıyor (client-side sınırlamalar nedeniyle).

#### 26 Nisan — FCM ve Admin Paneli
- Firebase Cloud Messaging entegrasyonu tamamlandı.
- Admin panel geliştirildi: dashboard, kullanıcılar, sürücüler, sürüşler, ödemeler, uyuşmazlıklar, ayarlar.
- Admin yapma endpoint'i eklendi.
- **Telefon format karmaşası:** 10 hane mi 11 hane mi olacak konusunda karışıklık yaşandı. Sonunda 11 hane (0 ile başlayan) standart kabul edildi.
- Ödemeler sayfasında `revenueSummary`, `user` ve `ride` null kontrolleri eklendi.

### 🗓️ MAYIS 2026

#### 1 Mayıs — PWA ve TWA
- Admin panel 404 hatası düzeltildi (sürücüler sayfası).
- PWA iyileştirmeleri: offline sayfa, maskable ikonlar, manifest id.
- `assetlinks.json` eklendi (TWA doğrulaması için).
- `.well-known` path'i Vercel'de çalışmıyordu → API route olarak eklendi.
- Telefon kayıt: otomatik `0` prefix ekleme ve validasyon.

#### 3 Mayıs — Büyük Oturum: Çoklu Düzeltmeler
Bu oturumda birçok kritik düzeltme yapıldı:

1. **Adres otomatik tamamlama:** Kullanıcı adres yazınca otomatik konum seçimi + Enter desteği eklendi. Geocode API endpoint'i oluşturuldu.
2. **Şifremi unuttum bug'ı:** Telefon normalizasyon hatası (10 hane → 0+11 hane dönüşümü eksikti). Route NextAuth catch-all ile çakışıyordu → `/api/password/` altına taşındı.
3. **RideStatus enum uyumsuzluğu:** Prisma'da `PHOTOS_BEFORE/AFTER`, kodda `PHOTO_BEFORE/AFTER` kullanılıyordu → düzeltildi.
4. **Sürücü değerlendirme sistemi:** Yolculuk tamamlanınca 1-5 yıldız + yorum. `ratingAvg` ve `ratingCount` otomatik güncelleme.
5. **Google Maps API key:** Server-side route'larda önce kısıtlamasız key kullanılacak şekilde düzeltildi.
6. **assetlinks.json:** Doğru SHA256 fingerprint ile güncellendi.

**End-to-end test başarılı:**
- Müşteri hesabı oluşturuldu (05321110001)
- Araç eklendi (BMW 3 Serisi - 34 TT 001)
- Kart eklendi (Visa **** 1111)
- Taksim → Kadıköy talebi oluşturuldu
- Sürücü teklif verdi (₺2.600), kabul edildi
- Yolculuk tamamlandı, 5 yıldız değerlendirme yapıldı ✅

#### 13 Mayıs — Domain Geçişi ve TWA Build
- Domain `www.getdriver.com.tr`'ye geçirildi.
- DNS: Natro panelinden CNAME güncellendi → Vercel DNS.
- TWA v3 build alındı (APK + AAB).
- `local.properties` eksikti → eklendi.
- Eksik drawable/mipmap dosyaları eklendi (splash, notification icon, maskable icon).
- Play Console yükleme rehberi oluşturuldu.

#### 14 Mayıs — Durum Raporu
- Kapsamlı durum raporu hazırlandı.
- 17 temel özellik tamamlanmış durumda.

#### 16 Mayıs — Play Store Production Hazırlığı
- Store listing metinleri (Türkçe) hazırlandı.
- Content rating, data safety, target audience cevapları hazırlandı.
- Gizlilik politikası: https://www.getdriver.com.tr/gizlilik
- **İkon tasarımı:** Uzun bir süreç yaşandı:
  - G harfli, direksiyon, yol çizgili, kalkan, araba gibi birçok varyasyon denendi.
  - Ali simetrik olmayanları reddetti.
  - **Son seçim:** Yeşil arka plan, neon glow'lu kalkan, içinde beyaz araba silüeti, "GetDriver" yazısı.
- 4 adet ekran görüntüsü oluşturuldu (welcome, usecases, howitworks, safety).
  - Emoji render sorunu yaşandı → yeşil daireli ikonlar kullanıldı.
  - Screenshot 3'te beyaz kart içinde beyaz yazı sorunu düzeltildi.
- Feature graphic (1024x500 banner) oluşturuldu.

#### 18 Mayıs — Reklam Görselleri
- 5 sahnelik reklam görseli tasarlandı.
- **Sorunlar:** Karakterler çok yakın çekilmişti, İngilizce detaylar vardı.
- **Düzeltmeler:**
  - Geniş açılı çekimler
  - Tüm yazılar Türkçe
  - İstanbul plakaları (34 KRD 34)
  - Türkçe isimler ve tabelalar
- **Sahneler:**
  1. Restaurant önü gece (Lütfi Kırdar)
  2. Şoför araç kullanıyor, müşteri arkada laptop ile çalışıyor
  3. Havalimanı gece karşılama
  4. İstanbul Boğazı'nda gece sürüş
  5. Güvenli yolculuk - ıslak İstanbul sokakları

#### 29 Mayıs — iOS Build Başlangıcı
- GitHub'dan proje çekildi.
- Capacitor kuruldu (`@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`).
- Next.js `output: 'export'` ayarlandı (statik build).
- iOS platformu eklendi.
- **MacBook Air A1466 (2017) sorunu:** macOS Monterey (12.x) → Xcode 15+ desteklemiyor (Sonoma gerekli).
- **Çözüm:** GitHub Actions ile cloud build.
- GitHub Actions workflow oluşturuldu.
- **Build geçmişi:**
  - Build #2: Node.js 20 < 22 → yükseltildi
  - Build #4: App.xcworkspace yok → App.xcodeproj kullanıldı
  - Build #6: iPhone 15 simulator yok → iPhone 16 kullanıldı
  - Build #8: AppIcon 512x512 → 1024x1024 yeniden boyutlandırıldı
  - Build #10: Artifact yok → -derivedDataPath eklendi
  - Build #12: ✅ Başarılı
  - Build #15: iPhone 16 bulunamadı → iPhone 16e kullanıldı
  - Build #17: ✅ Başarılı (simulator build)

### 🗓️ HAZİRAN 2026

#### 1-4 Haziran — iOS App Store Build Denemeleri
- Simulator build başarılıydı ama App Store için gerçek cihaz build'i gerekiyordu.
- Apple Developer hesabı ($99/yıl) üzerinden sertifikalar oluşturuldu.
- **Code signing sorunları başladı:**
  - Development certificate ile archive oluşturuluyordu → App Store validation'da reddediliyordu.
  - Distribution certificate gerekiyordu.
  - Framework'ler (Capacitor, Cordova) imzalanmamıştı.
- **Build #48 (1 Haz):** Başarılı görünüyor (doğrulanmadı).
- **Build #52 (4 Haz):** GitHub'ta "success" ama aslında upload başarısız — Validation failed (409) Invalid Signature.
- **Build #54 (4 Haz):** Archive adımında signing hatası.

#### 7 Haziran — iOS Durum
- Temel sorun: Code signing. Distribution sertifikası doğru yapılandırılmamış.
- TestFlight'a build ulaşmıyor.
- **Yapılması gerekenler:**
  1. Apple Developer Portal'da Distribution sertifikası kontrolü/oluşturma
  2. Provisioning profile güncelleme (App Store Distribution)
  3. GitHub Secrets kontrolü
  4. Workflow düzeltme (hata kontrolü + framework imzalama)

---

## 5. YAPILAN HATALAR VE ÇÖZÜMLERİ (DETAYLI)

Bu bölüm, projede karşılaşılan tüm önemli hataları ve çözümlerini kronolojik sırayla listelemektedir.

### HATA #1: Google OAuth Karmaşası
- **Tarih:** 6-8 Nisan
- **Sorun:** Google OAuth entegrasyonu çok fazla sorun çıkarıyordu — cookie yapılandırması, PrismaAdapter uyumsuzluğu, kullanıcı oluşturma eksikliği.
- **Denenen çözümler:** trustHost ekleme, cookie config kaldırma, PrismaAdapter devre dışı bırakma, kullanıcı otomatik oluşturma.
- **Nihai çözüm:** Google OAuth tamamen kaldırıldı, sadece telefon/şifre girişi bırakıldı.
- **Ders:** Basit tut. Türk kullanıcılar telefon girişini tercih ediyor.

### HATA #2: Password Field Adı Yanlış
- **Tarih:** 7 Nisan
- **Sorun:** Veritabanında alan adı `password` iken kod `passwordHash` kullanıyordu.
- **Belirti:** Kullanıcılar giriş yapamıyordu.
- **Çözüm:** `passwordHash` → `password` olarak düzeltildi.

### HATA #3: Rate Limiting Kayıtları Engelliyordu
- **Tarih:** 9 Nisan
- **Sorun:** Rate limiter çok agresif ayarlanmıştı, normal kayıt denemeleri bile engelleniyordu.
- **Çözüm:** Debug süresince geçici olarak devre dışı bırakıldı.

### HATA #4: Google Maps API Key Sorunu
- **Tarih:** 11-13 Nisan
- **Sorun:** Maps API yüklenmiyor, harita görüntülenmiyor.
- **Kök neden:** `GOOGLE_MAPS_API_KEY` environment variable'ı Places API endpoint'lerinde tanımlı değildi. Ayrıca auth gereksinimleri harita bileşenlerini engelliyordu.
- **Denenen çözümler:** Debug logging, hardcoded API key, auth kaldırma.
- **Nihai çözüm:** Environment variable doğru eklendi + auth gereksinimleri kaldırıldı.
- **İkinci sorun:** Browser key'de HTTP referrer kısıtlaması vardı, `getdriver.vercel.app` authorize edilmemişti → eklendi.
- **Üçüncü çözüm:** Server-side route'larda kısıtlamasız key (`GOOGLE_MAPS_API_KEY`) öncelikli kullanılacak şekilde düzeltildi.

### HATA #5: Telefon Numarası Format Karmaşası
- **Tarih:** 20 Nisan - 1 Mayıs (sürekli tekrarlayan)
- **Sorun:** Telefon numarasının kaç haneli saklanacağı konusunda tutarsızlık.
- **Süreç:**
  1. İlk başta 10 hane (0'sız): `5XXXXXXXXX`
  2. Sonra 11 hane (0'lı): `05XXXXXXXXX` olarak değiştirildi
  3. Giriş ve admin ekranlarında 0 eklenmesi gerekti
  4. Kayıtta otomatik 0 prefix ekleme
  5. Validasyon: 10 haneli girişe otomatik 0 ekleme
- **Nihai standart:** **11 hane, 0 ile başlayan** (`05XXXXXXXXX`)
- **Ders:** Telefon formatını baştan belirle ve tüm projeye uygula. Bu hata en az 6 commit gerektirdi.

### HATA #6: Şifremi Unuttum — İki Ayrı Bug
- **Tarih:** 3 Mayıs
- **Bug 1 - Telefon normalizasyonu:** Forgot-password API 10 hane bekliyordu ama DB'de 11 hane saklanıyordu → kullanıcı bulunamıyordu.
  - **Çözüm:** Input normalize edildi (0 eklendi).
- **Bug 2 - Route çakışması:** `/api/auth/forgot-password` route'u NextAuth'un catch-all route'u ile çakışıyordu → hiç çalışmıyordu.
  - **Çözüm:** `/api/password/forgot` altına taşındı.

### HATA #7: RideStatus Enum Uyumsuzluğu
- **Tarih:** 3 Mayıs
- **Sorun:** Prisma schema'da `PHOTOS_BEFORE` / `PHOTOS_AFTER` (çoğul), kodda `PHOTO_BEFORE` / `PHOTO_AFTER` (tekil) kullanılıyordu.
- **Belirti:** Fotoğraf yükleme adımı çalışmıyordu.
- **Çözüm:** Kod Prisma schema ile eşleştirildi.

### HATA #8: Beyaz Ekran (Permission Hook)
- **Tarih:** 20-21 Nisan
- **Sorun:** Kayıt sonrası izin isteme sayfası beyaz ekran veriyordu.
- **Kök neden 1:** Permission hook'taki `toast` bağımlılığı → kaldırıldı.
- **Kök neden 2:** Permission request sayfasında render hatası → otomatik yönlendirme eklendi.
- **Tasarım değişikliği:** İzinler kayıt sırasında değil, özellik kullanılırken istenecek (lazy permission request).

### HATA #9: assetlinks.json TWA Doğrulama
- **Tarih:** 1-13 Mayıs (birden fazla düzeltme)
- **Sorun:** Android TWA uygulaması web sitesini doğrulayamıyordu.
- **Kök nedenler:**
  1. `.well-known/assetlinks.json` statik dosya olarak Vercel'de servis edilmiyordu → API route eklendi.
  2. Yanlış SHA256 fingerprint kullanılmıştı (farklı keystore).
  3. Package name hatası.
- **Düzeltme sayısı:** 4 ayrı commit gerekti.
- **Ders:** assetlinks.json'ı her keystore değişikliğinde güncelle.

### HATA #10: TWA Build — Eksik Dosyalar
- **Tarih:** 13 Mayıs
- **Sorun:** Gradle build başarısız — eksik drawable/mipmap dosyaları.
- **Eksik dosyalar:** `splash.png`, `ic_notification_icon.png`, `ic_maskable.png` (5 farklı çözünürlük).
- **Çözüm:** Tüm dosyalar doğru boyutlarda oluşturulup eklendi.

### HATA #11: iOS Build — Node.js Versiyon Uyumsuzluğu
- **Tarih:** 29 Mayıs
- **Sorun:** GitHub Actions'ta Node.js 20 kuruluydu, proje Node.js 22 gerektiriyordu.
- **Çözüm:** Workflow'da Node.js 22'ye yükseltildi.

### HATA #12: iOS Build — Simulator Bulunamadı
- **Tarih:** 29 Mayıs
- **Sorun:** iPhone 15 simulator GitHub Actions runner'da yoktu.
- **Çözüm 1:** iPhone 16'ya geçildi.
- **Sorun 2:** iPhone 16 da bulunamadı.
- **Çözüm 2:** iPhone 16e kullanıldı.

### HATA #13: iOS Build — AppIcon Boyutu
- **Tarih:** 29 Mayıs
- **Sorun:** AppIcon 512x512 olarak eklenmiş, Xcode 1024x1024 istiyordu.
- **Çözüm:** 1024x1024 olarak yeniden boyutlandırıldı.

### HATA #14: iOS Code Signing Cehennemi
- **Tarih:** Haziran 2026 (devam ediyor)
- **Sorun:** App Store'a yüklenecek build'de code signing doğru çalışmıyor.
- **Denenen çözümler (en az 15 farklı commit):**
  1. Automatic signing → başarısız
  2. Manual signing + Apple Distribution → başarısız
  3. Development signing + Distribution re-signing → başarısız
  4. Separate export + altool upload → başarısız
  5. xcodebuild destination=upload → başarısız
  6. Distribution cert import to CI keychain → başarısız
  7. Framework'lerin ayrıca imzalanması → henüz çözülmedi
- **Kök sorun:** Development certificate ile archive oluşturuluyor, App Store Connect validation'da reject ediliyor. Capacitor ve Cordova framework'leri de ayrıca imzalanması gerekiyor.
- **Durum:** AÇIK — çözülmedi.

### HATA #15: Fotoğraf Yükleme Sorunu
- **Tarih:** Mayıs-Haziran
- **Sorun:** Sürücü fotoğraf yüklemesi sunucu hatası veriyordu.
- **Kök neden:** PhotoType enum uyumsuzluğu.
- **Denenen çözümler:**
  1. Vercel Blob Storage → sorunluydu
  2. Client-side compress + doğrudan DB'ye kaydet → çalıştı
  3. Base64 data URL olarak saklama → nihai çözüm

### HATA #16: S3 → Vercel Blob Geçişi
- **Sorun:** AWS S3 yapılandırması karmaşıktı.
- **Çözüm:** S3 kaldırıldı, Vercel Blob Storage'a geçildi.

---

## 6. TAMAMLANAN ÖZELLİKLER

### Kimlik Doğrulama ve Kullanıcı Yönetimi
1. ✅ Telefon/Şifre tabanlı kayıt ve giriş
2. ✅ Şifremi unuttum (SMS ile OTP)
3. ✅ Rol bazlı yönlendirme (müşteri/sürücü/admin)
4. ✅ İzin yönetimi (konum, kamera, bildirim — lazy request)

### Sürücü Tarafı
5. ✅ Sürücü başvuru ve belge yükleme süreci
6. ✅ Sürücü online/offline durumu
7. ✅ Birden fazla aktif yolculuk gösterimi
8. ✅ Gerçek zamanlı konum paylaşımı
9. ✅ Sürücü değerlendirme/rating sistemi

### Müşteri Tarafı
10. ✅ Adres otomatik tamamlama (Google Places API)
11. ✅ Yolculuk talebi oluşturma
12. ✅ Sürücü eşleştirme algoritması
13. ✅ Gerçek zamanlı sürücü takibi
14. ✅ Önceden rezervasyon
15. ✅ Rezervasyon iptal ve no-show kuralları
16. ✅ Mesajlaşma (RideChat component)
17. ✅ 4 açılı fotoğraf sistemi (araç her yönden belgeleniyor)

### Ödeme ve Bildirimler
18. ✅ PayTR ödeme sistemi entegrasyonu
19. ✅ Firebase Cloud Messaging bildirimleri
20. ✅ Web Push (VAPID)
21. ✅ SMS/OTP (İleti Merkezi)

### Admin Paneli
22. ✅ Dashboard
23. ✅ Kullanıcı yönetimi
24. ✅ Sürücü yönetimi ve onay
25. ✅ Yolculuk takibi
26. ✅ Ödeme takibi
27. ✅ Uyuşmazlık yönetimi
28. ✅ Ayarlar sayfası
29. ✅ Excel export (sürücü, müşteri, yolculuk, ödemeler)

### Platform ve Dağıtım
30. ✅ PWA desteği (offline sayfa, maskable ikonlar)
31. ✅ Android TWA uygulaması (Play Store)
32. ✅ Yasal belgeler (KVKK, sözleşme onayları, gizlilik politikası)
33. ✅ İletişim adresleri güncellendi (destek@getdriver.com.tr)

---

## 7. ANDROID TWA SÜRECİ

### TWA Nedir?
Trusted Web Activity — web sitesini native Android uygulaması olarak paketler. Chrome altyapısını kullanır, URL bar'ı gizler.

### Geliştirme Adımları
1. **Bubblewrap ile proje oluşturuldu** (`/home/ubuntu/getdriver-twa/`)
2. **Keystore oluşturuldu:** `android.keystore`, şifre: `getdriver2026`
3. **SHA256 fingerprint:** `AE:80:61:B6:4F:E5:2D:B4:6E:8A:BD:BF:03:BE:C2:CA:4C:AC:62:50:B1:64:19:5B:7A:F5:87:90:26:44:A9:B6`
4. **Package name:** `com.getdriver.app`
5. **assetlinks.json güncellendi** (doğru fingerprint ile)
6. **Eksik drawable/mipmap dosyaları eklendi**
7. **Gradle build başarılı:**
   - APK: `getdriver-v3-signed.apk` (~1.2 MB)
   - AAB: `getdriver-v3-signed.aab` (~1.3 MB)
8. **Version Code:** 3

### Dosya Konumları
- TWA projesi: `/home/ubuntu/getdriver-twa/`
- İmzalı AAB: `/home/ubuntu/getdriver-twa/getdriver-v3-signed.aab`
- Keystore: `/home/ubuntu/getdriver-twa/android.keystore`

---

## 8. iOS BUILD SÜRECİ

### Yaklaşım
1. **İlk plan:** Ali'nin MacBook Air A1466 (2017) ile local build → **başarısız** (macOS Monterey, Xcode 15+ desteklemiyor).
2. **İkinci plan:** GitHub Actions ile cloud build → simulator build başarılı, App Store build devam ediyor.
3. **Alternatif:** Codemagic (ücretsiz 500 dakika/ay).

### Capacitor Kurulumu
- `capacitor.config.ts` yapılandırıldı
- Next.js `output: 'export'` (statik build)
- Bundle ID: `com.getdriver.app`
- Info.plist: konum, kamera izinleri

### GitHub Actions Workflow
- Dosya: `.github/workflows/ios-build.yml`
- macOS runner üzerinde çalışıyor
- Artifact upload desteği

### Build Geçmişi (Özet)
| Build | Tarih | Durum | Sorun/Çözüm |
|-------|-------|-------|--------------|
| #2 | 29 May | ❌ | Node.js 20 → 22'ye yükselt |
| #4 | 29 May | ❌ | xcworkspace yok → xcodeproj kullan |
| #6 | 29 May | ❌ | iPhone 15 yok → iPhone 16 |
| #8 | 29 May | ❌ | AppIcon 512→1024 |
| #10 | 29 May | ❌ | Artifact path → derivedDataPath |
| #12 | 29 May | ✅ | Simulator build başarılı |
| #17 | 29 May | ✅ | Simulator build başarılı |
| #48 | 1 Haz | ⚠️ | Başarılı görünüyor, doğrulanmadı |
| #52 | 4 Haz | ❌ | Upload fail (Invalid Signature 409) |
| #54 | 4 Haz | ❌ | Archive signing hatası |

### Mevcut iOS Sorunu
- **Code signing düzgün çalışmıyor**
- Development cert ile archive → Distribution cert ile re-sign gerekiyor
- Capacitor/Cordova framework'leri ayrıca imzalanmalı
- TestFlight'a build ulaşmıyor

### Gerekli GitHub Secrets
| Secret | Açıklama |
|--------|----------|
| `APPSTORE_ISSUER_ID` | App Store Connect API Issuer ID |
| `APPSTORE_KEY_ID` | API Key ID |
| `APPSTORE_PRIVATE_KEY` | .p8 dosyası içeriği |
| `APPLE_TEAM_ID` | Apple Developer Team ID |

---

## 9. PLAY STORE YAYINLAMA SÜRECİ

### Store Listing (Türkçe)
- Başlık: GetDriver
- Kısa/uzun açıklamalar hazırlandı
- Content rating, data safety, target audience dolduruldu
- Gizlilik politikası: https://www.getdriver.com.tr/gizlilik

### Görsel Materyaller
- Uygulama ikonu: Yeşil arka plan, kalkan + araba silüeti, "GetDriver" yazısı
- 4 adet ekran görüntüsü (welcome, usecases, howitworks, safety)
- Feature graphic (1024x500 banner)
- 5 adet reklam görseli (İstanbul temalı, Türkçe)

### Durum
- Dahili test tamamlandı
- Production release için içerikler hazır
- **Play Console hesabı:** artessamsun@gmail.com olabilir (kesinleştirilmedi)

---

## 10. DNS VE DOMAIN YAPILANDIRMASI

### Domain: www.getdriver.com.tr
- **Registrar:** Natro
- **DNS değişikliği (13 Mayıs):**
  - Eski CNAME (getdriver.com.tr'ye yönlü) silindi
  - Yeni CNAME: `www` → `5596062a815db860.vercel-dns-017.com.`
  - DNS propagasyonu tamamlandı
  - SSL sertifikası Vercel tarafından oluşturuldu
- **Bare domain (getdriver.com.tr):** Hâlâ Natro IP'sine (94.73.148.123) yönlü. Vercel A kaydına (76.76.21.21) güncellenmesi önerildi.

### Vercel Yapılandırması
- Otomatik deploy (GitHub push ile)
- SSL/HTTPS aktif
- assetlinks.json API route ile servis ediliyor

---

## 11. MEVCUT DURUM VE AÇIK KONULAR

### ✅ Çalışan
- Web sitesi (www.getdriver.com.tr) — aktif ve çalışıyor
- Android TWA uygulaması — dahili test tamamlandı
- Tüm temel özellikler (33 özellik)

### 🔴 Çözülmemiş / Devam Eden
1. **iOS code signing** — TestFlight'a build ulaşmıyor (Distribution cert + framework signing sorunu)
2. **Play Console production release** — İçerikler hazır, yükleme bekliyor
3. **Bare domain (getdriver.com.tr)** — Vercel A kaydına güncellenmeli
4. **SMS (İleti Merkezi)** — `ILETIMERKEZI_API_KEY` ve `ILETIMERKEZI_API_HASH` Vercel env'e eklenmiş mi kontrol edilmeli

### 🟡 Doğrulanması Gereken
5. Google OAuth Redirect URI — `www.getdriver.com.tr` authorize edilmeli
6. Google Maps API Key — `www.getdriver.com.tr` referrer'ı eklenmeli
7. Vercel deploy — GitHub push'u otomatik deploy ediyor mu?

---

## 12. ÖNEMLİ DOSYA KONUMLARI

| Dosya/Dizin | Konum | Açıklama |
|-------------|-------|----------|
| Ana web repo | `/home/ubuntu/getdriver-github/` | GitHub'dan klonlanmış güncel repo |
| Eski yedek | `/home/ubuntu/backup-20260503_183346/getdriver/` | 3 Mayıs öncesi yedek |
| TWA projesi | `/home/ubuntu/getdriver-twa/` | Android TWA build dosyaları |
| İmzalı AAB | `/home/ubuntu/getdriver-twa/getdriver-v3-signed.aab` | Play Store upload dosyası |
| Keystore | `/home/ubuntu/getdriver-twa/android.keystore` | TWA imzalama anahtarı |
| iOS projesi | `/home/ubuntu/getdriver-github/ios/` | Capacitor iOS projesi |
| iOS zip | `/home/ubuntu/getdriver-ios.zip` | iOS projesi zip |
| Workflow | `/home/ubuntu/getdriver-github/.github/workflows/ios-build.yml` | GitHub Actions |
| İkon galerisi | `/home/ubuntu/getdriver-twa/icon-gallery.html` | Tüm ikon varyasyonları |
| Play rehberi | `/home/ubuntu/getdriver-twa/PLAY-CONSOLE-GUIDE.md` | Play Console adım adım |
| Production rehberi | `/home/ubuntu/getdriver-twa/PRODUCTION-RELEASE-GUIDE.md` | Store listing + content |
| App Store rehberi | `/home/ubuntu/getdriver-github/APPSTORE-CONNECT-KURULUMU.md` | iOS App Store rehberi |

---

## 13. HESAP BİLGİLERİ VE ERİŞİMLER

| Servis | Hesap | Not |
|--------|-------|-----|
| GitHub | arteshidrolik-sketch | Repo: getdriver |
| Vercel | arteshidrolik@gmail.com | Auto-deploy aktif |
| Natro (Domain) | — | www.getdriver.com.tr |
| Google Cloud (Maps) | — | Maps API + Places API |
| Firebase | — | FCM bildirimleri |
| PayTR | — | Ödeme sistemi |
| İleti Merkezi | — | SMS/OTP |
| Apple Developer | — | iOS build ($99/yıl) |
| Play Console | artessamsun@gmail.com (?) | Android app |
| Neon | — | PostgreSQL veritabanı |

---

## 14. GIT COMMIT GEÇMİŞİ (TAM LİSTE — Kronolojik)

### Nisan 2026
```
d6b2e43 - Initial commit - GetDriver
6ee9dc5 - Fix: add force-dynamic to API routes
7f7f4f9 - Fix: remove outputFileTracingRoot for Vercel
33c3b3f - Fix: Google OAuth signin button - add NEXTAUTH_URL
54e5898 - fix: add trustHost, remove problematic cookie config
2c06b4c - fix: disable PrismaAdapter - incompatible with JWT
759b78b - fix: Google OAuth - create user on first login
ace4962 - fix: use correct field name 'password' instead of 'passwordHash'
19b65b0 - Remove Google OAuth login, keep only phone/password login
67acf8b - Add detailed error message for signup debugging
50fc331 - Add detailed error message for frontend signup debugging
48a37e9 - Completely remove Google OAuth from auth options
4d562ae - Temporarily disable rate limiting for signup debugging
613be2e - Add error code to signup error message
4f493e1 - Clean install dependencies
de21d29 - Make Maps API config public - remove auth requirement
6e811ca - Add debug logging for Google Maps loading
026e22f - Use hardcoded API key directly in component
99e62af - Fix syntax error in GoogleMap component
d5a681b - Remove auth requirement from Places API endpoints
67daa63 - Fix: Places API GOOGLE_MAPS_API_KEY env eksikti
325b9b5 - feat: Sürücü eşleştirme özelliği tamamlandı
5fff587 - feat: Sürücü online/offline arayüzü tamamlandı
4b9afd4 - feat: Gerçek zamanlı sürücü takip özelliği
723005e - feat: PayTR ödeme sistemi entegrasyonu
5d4a0ea - feat: Şifremi unuttum özelliği tamamlandı
9ad594b - fix: Eski kullanıcıların giriş yapamama sorunu
f59fc27 - Hata mesajini detaylandir
ced74f2 - test: GetDriver full flow test suite eklendi
a83ab52 - feat: Önceden rezervasyon özelliği
4057ccd - feat: Rezervasyon iptal ve no-show kuralları
0b2b3fe - fix: Sürücü başvurusu API'si düzeltildi
11964c4 - fix: sürücü kabul/red butonları kaldırıldı
405979d - fix: sürücü dashboard birden fazla aktif yolculuk
8e33688 - fix: aktif yolculuk limit 1→10
99fb800 - feat: kayıt sırasında izinler isteniyor
68cfe1a - feat: admin panelde excel export
c75eed4 - fix: permission hook - toast bağımlılığı kaldırıldı
b8b5c20 - fix: permission request - beyaz ekran düzeltildi
3a9a78e - feat: telefon formatı düzeltildi (0XXX XXX XX XX)
e53c6f6 - fix: telefon formatı 0(XXX) XXX XX XX
f6702cc - fix: telefon input sadece rakam, 10 hane
3908b09 - fix: kayıt sonrası yönlendirme düzeltildi
4a99570 - fix: izinler sayfası mutlaka gösterilsin
8509ae3 - fix: izinler sayfası debugging eklendi
6559fb3 - refactor: izinler kullanırken istenecek
054ee6c - fix: reverse geocode API üzerinden
31ce612 - feat: Firebase Cloud Messaging entegrasyonu
12b11eb - fix: notification API imports düzeltildi
b3c2644 - feat: admin panel geliştirildi
fd6fa2c - feat: admin yapma endpoint
ec58412 - temp: fcmToken removed until migration
3a52cb9 - feat: admin sürücüler, sürüşler, uyuşmazlıklar
3b3e870 - fix: ödemeler revenueSummary fix
cea38c4 - feat: ayarlar sayfası eklendi
dacb50e - fix: ödemeler user ve ride null kontrolü
e5f27b0 - fix: telefon format 10 hane
6bd691f - fix: telefon format 11 hane (0 ile başlayan)
```

### Mayıs 2026
```
3a9e125 - fix: admin panel 404, db fallback, toast variant
13cd690 - PWA iyileştirmeleri: offline, maskable ikonlar
8bed178 - manifest id güncellendi
231b91c - assetlinks.json eklendi (TWA doğrulaması)
4527c4c - assetlinks.json API route eklendi
ad9ec4e - fix: telefon kayıt otomatik 0 prefix
3a88d9a - fix: telefon validasyonu 10→11 hane
b7b719c - fix: adres yazınca otomatik konum seçimi
a221704 - fix: geocode API endpoint eklendi
64dbecb - fix: geocode API dynamic export
4085af4 - Fix: onBlur geocode only when not selected
23adc39 - chore: trigger vercel deploy
5b60c31 - fix: şifremi-unuttum telefon normalizasyonu
83c46f5 - fix: şifremi-unuttum route NextAuth çakışması
6dcb8c2 - fix: server-side GOOGLE_MAPS_API_KEY önce kullan
aa27fcd - fix: RideStatus enum PHOTOS_BEFORE/AFTER
8e560b7 - feat: sürücü değerlendirme (rating) özelliği
07dc84f - fix: assetlinks com.getdriver.app + yeni SHA256
1be2e04 - fix: assetlinks PWABuilder keystore SHA256
0ccad1b - fix: domain www.getdriver.com.tr geçişi
318c614 - fix: assetlinks doğru SHA256 fingerprint
9a40d40 - fix: Google Maps API key hardcoded sorunu
cbe23f8 - feat: S3 kaldırıldı, Vercel Blob Storage geçişi
11f6147 - GitHub Actions iOS build workflow eklendi
374d62d - GitHub Actions rehberi güncellendi
f18f055 - fix: GitHub Actions Node.js 22'ye yükseltildi
f376c7c - fix: xcodebuild workspace→project
ec61f8d - fix: iPhone 16 simulator kullan
16a775f - fix: AppIcon 1024x1024
5582b75 - fix: Build artifact path
01b05ea - docs: Sonuç raporu güncellendi
31f005d - fix: iPhone 16e simulator kullan
6013dd2 - docs: App Store Connect kurulum rehberi
35f28b7 - docs: Sonuç raporu build #17 başarılı
01b82e7 - feat: App Store build + TestFlight upload workflow
e75aa10 - fix: Apple Distribution signing kullan
6a24205 - fix: Xcode project signing ayarları
777bae5 - fix: Manual signing + Apple Distribution
3c6cd20 - fix: Automatic signing cihaz kaydedildi
479016e - fix: Distribution signing + improved export
9644bcd - fix: Remove conflicting CODE_SIGN_IDENTITY
0eaf93e - fix: iPad orientations + Distribution re-signing
506264a - fix: YAML syntax error printf + separate steps
3e69cab - fix: Upload TestFlight xcrun altool
f2c687a - fix: API route'ları geri yüklendi
9627b2f - fix: placeholder sayfalar gerçek içerikle değiştirildi
d992029 - feat: mesajlaşma eklendi (RideChat component)
a9cbcd5 - fix: Sürücü aksiyon butonları fixed→inline
8c0a5bd - fix: Fotoğraf yükleme base64 data URL
a75f9a1 - fix: Fotoğraf yükleme client-side compress
e7abb1e - fix: Fotoğraf yükleme PhotoType enum
60432bb - feat: 4 açılı fotoğraf sistemi
db9dc35 - feat: Sözleşme ve KVKK onayları
17a13d2 - feat: Profil yasal belgeler bölümü
804b67f - fix: İletişim adresleri destek@getdriver.com.tr
43f5909 - fix: iOS build pipeline tamamen düzeltildi
f13f7a6 - fix: macOS uyumlu mobile-build.sh
9f43759 - fix: Upload App Store Connect altool
3d08820 - fix: Archive development + re-sign distribution
6906752 - fix: Separate export + upload + validate IPA
96b3264 - fix: Manual distribution signing + error detection
4f41400 - fix: YAML heredoc printf ExportOptions
123d28c - fix: Automatic signing + upload error detection
c1dc3cc - fix: Xcode Automatic + Apple Development for CI
d77b063 - fix: xcodebuild destination=upload (deprecated altool)
6a4f612 - fix: python3 plistlib ExportOptions + destination=upload
3e4a7d9 - fix: Separate export + altool upload
0e795a7 - fix: Import Distribution cert into CI keychain
```

---

## 📌 ÖNEMLİ NOTLAR

### Ali'nin Tercihleri
- **İkon tasarımı:** Yeşil tonlar, araba görseli, kalkan (güvenlik hissi), simetrik tasarım, "GetDriver" yazısı (G ve D büyük).
- **Dil:** Tüm kullanıcıya görünen içerikler Türkçe.
- **Platform önceliği:** Android → iOS.

### Teknik Standartlar
- **Telefon formatı:** 11 hane, 0 ile başlayan (`05XXXXXXXXX`)
- **RideStatus enum:** Prisma schema ile birebir eşleşmeli
- **API key stratejisi:** Server-side'da kısıtlamasız key, client-side'da referrer kısıtlı key
- **Deploy:** Vercel auto-deploy (GitHub push)

### Dikkat Edilmesi Gerekenler
- Telefon formatı değişiklikleri dikkatli yapılmalı (6+ kez hata yapıldı)
- assetlinks.json her keystore değişikliğinde güncellenmeli
- iOS code signing konusu hâlâ çözülmedi — Distribution cert + framework signing gerekiyor
- Play Console hesabının hangi email'de olduğu kesinleştirilmeli

---

> **Bu dosyayı bir AI asistanına verdiğinizde**, projenin tüm geçmişini, teknik altyapısını, yapılan hataları ve mevcut durumunu anlayacaktır. Herhangi bir soruya doğrudan cevap verebilecek kadar detay içermektedir.
