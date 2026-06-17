# 🚀 GetDriver - Test Kullanıcısı Bulma & Platform Üyelik Hareket Planı

> **Hedef:** Google Play 14 günlük kapalı test zorunluluğunu (12 aktif kullanıcı) en hızlı şekilde geçmek + organik beta test topluluğu kurmak.
> **Tarih:** 16 Haziran 2026
> **Sorumlu:** Ali Yücel Yalçın (arteshidrolik@gmail.com)

---

## 📊 MEVCUT DURUM ÖZETİ

| Bileşen | Durum | Not |
|---------|-------|-----|
| Android AAB (v5) | ✅ Hazır | `getdriver-v5-signed.aab` (1.3 MB) |
| Play Console | ⏳ Bekliyor | Production release yüklenecek |
| iOS TestFlight | 🔴 Bloklu | Code signing sorunu devam ediyor |
| Web Sitesi | ✅ Aktif | https://www.getdriver.com.tr |
| Store Listing | ✅ Hazır | Metinler, görseller, gizlilik politikası tamam |

**Kritik Blok:** Play Console'a henüz production release yüklendi mi / dahili testten kapalı teste geçildi mi? Bu net değil. **İlk adım bu kontrolü yapmak.**

---

## 🎯 STRATEJİ: Hibrit 2 Fazlı Model

### Faz 1: Google Play 14 Gün Zorunluluğu (Gün 0-14)
> **Amaç:** 12 aktif kullanıcıyı 14 gün boyunca tutmak. En hızlı ve güvenilir yöntem = ücretli kanallar.

### Faz 2: Organik Beta & Geniş Geri Bildirim (Gün 14+)
> **Amaç:** Kaliteli geri bildirim toplamak, gerçek kullanıcı deneyimi ölçmek.

---

## 📋 DETAYLI HAREKET PLANI

### ADIM 1: Play Console Kontrolü (Bugün - 1 saat)

**Yapılacak:**
1. [ ] https://play.google.com/console adresine giriş yap (artessamsun@gmail.com veya arteshidrolik@gmail.com)
2. [ ] `com.getdriver.app` uygulamasını bul
3. [ ] Mevcut test track'i kontrol et:
   - **Dahili test (Internal testing)** → Sadece Play Console davetli kullanıcılar
   - **Kapalı test (Closed testing)** → 12 kullanıcı + 14 gün gerekiyor (BU AŞAMAYA GEÇİŞ YAPILMALI)
4. [ ] Eğer kapalı teste geçilmediyse: `getdriver-v5-signed.aab` dosyasını kapalı test kanalına yükle

**Test Kullanıcısı Ekleme (Kapalı Test):**
- Play Console → com.getdriver.app → Testing → Closed testing
- "Create track" veya mevcut track'e gir
- "Testers" sekmesi → Email listesi ekle
- 12+ Gmail adresi ekle (bunları sonraki adımlarda toplayacağız)

---

### ADIM 2: Platform Üyelikleri (Bugün - 2 saat)

#### A) Upwork (İşveren olarak kaydol)
- **URL:** https://www.upwork.com/nx/signup/
- **Kaydol:** "Hire a freelancer" seçeneği
- **Hesap:** arteshidrolik@gmail.com kullan
- **Ödeme:** Kredi kartı veya PayPal bağla
- **Maliyet:** İlan başına ~$50-100 + %7.99 client fee
- **İlan başlığı:** "Mobile App Beta Tester - 14 Day Continuous Testing (Turkey)"

**İlan Taslağı:**
```
We're launching a new ride-hailing app in Turkey and need 15 reliable beta testers.

Requirements:
- Must have an Android phone
- Must use the app daily for 14 consecutive days
- Must have a Gmail account (for Google Play closed testing invite)
- Turkey-based preferred (Istanbul, Ankara, Izmir)

Tasks:
1. Download app via Google Play test link
2. Open app at least once daily for 14 days
3. Test basic flows: registration, booking, driver matching
4. Report any bugs or issues via email/Discord

Payment: $X per tester (paid after 14-day completion verification)
We're looking for 15 testers. Apply now!
```

#### B) Fiverr (Buyer olarak kaydol)
- **URL:** https://www.fiverr.com/
- **Kaydol:** arteshidrolik@gmail.com
- **Arama:** "app testing" veya "beta testing" veya "QA testing mobile"
- **Yaklaşım:** Doğrudan satıcılara mesaj at
- **Maliyet:** $5-30/tester (çok değişken)

**Mesaj Taslağı:**
```
Hi! We're launching a ride-hailing app in Turkey. We need 15 beta testers for a 14-day continuous testing period. Each tester must:
- Have an Android device with Gmail account
- Open the app daily for 14 days
- Provide feedback on user experience

Can you provide this service? We need reliable testers who will actually use the app (not just install and forget). Budget is flexible.
```

#### C) Bionluk (Türkiye - Freelancer kiralama)
- **URL:** https://bionluk.com/
- **Kaydol:** arteshidrolik@gmail.com veya Google ile
- **Yaklaşım:** "Müşteri" olarak kaydol → İlan oluştur veya doğrudan freelancer ara
- **Arama:** "mobil uygulama testi", "QA test", "uygulama deneme"
- **Maliyet:** ~₺100-300/tester (Türkiye'de daha uygun)
- **Avantaj:** Yerel kullanıcılar, Türkçe iletişim, Google Play zorunluluğunu anlarlar

**İlan Taslağı (Türkçe):**
```
Yeni Şoför Uygulamamız İçin 15 Beta Test Kullanıcısı Arıyoruz

GetDriver - Türkiye'nin güvenli şoför platformu. Google Play kapalı test süreci için 15 güvenilir test kullanıcısı arıyoruz.

Gereksinimler:
- Android telefon sahibi olmak
- Gmail hesabı sahibi olmak (Google Play davetiyesi için)
- 14 gün BOYUNCA her gün uygulamayı açıp kullanmak
- İstanbul, Ankara veya İzmir'de olmak tercih sebebi

Yapılacaklar:
1. Google Play test davetiyesini kabul edip uygulamayı indirmek
2. 14 gün her gün en az bir kez uygulamayı açmak
3. Kayıt, sürücü çağırma, profil düzenleme gibi temel akışları test etmek

Ödeme: 14 gün tamamlandıktan ve doğrulandıktan sonra ödeme yapılacaktır.
Güvenilir, disiplinli çalışanlar arıyoruz. Sadece "indirdim" demek yetmez, aktif kullanım şart.
```

#### D) PrimeTestLab (Google Play test uzmanı)
- **URL:** https://primetestlab.com/
- **Kaydol:** Geliştirici hesabı oluştur
- **Hizmet:** "Google Play 12 Testers Closed Testing"
- **Maliyet:** ~$150-300 (12 kullanıcı × 14 gün garanti)
- **Avantaj:** Hızlı, garantili, Google Play sürecini bilirler
- **Dezavantaj:** Pahalı, geri bildirim kalitesi düşük olabilir

**Karar:**
- Bütçe varsa → PrimeTestLab (en hızlı, en güvenilir)
- Bütçe kısıtlıysa → Bionluk + Upwork kombinasyonu
- **Önerim:** Bionluk (15 kişi × ₺150 = ~₺2,250) + 2-3 Upwork tester (yedek)

---

### ADIM 3: Organik Kanallar - Hazırlık (Bugün - 1 saat)

#### A) Discord Sunucusu Kurulumu (Tüm test kullanıcıları için merkez)
1. [ ] https://discord.com/ → Yeni sunucu oluştur
2. [ ] Sunucu adı: "GetDriver Beta Test"
3. [ ] Kanallar:
   - `#davet-ve-kurallar` (davet linki, test kuralları)
   - `#android-test` (Android kullanıcıları)
   - `#ios-test` (iOS kullanıcıları - ileride)
   - `#hata-raporlari` (bug report)
   - `#geri-bildirim` (genel feedback)
   - `#sss` (sık sorulan sorular)
   - `#genel` (sohbet)
4. [ ] Roller:
   - `@Beta Tester` (tüm test kullanıcıları)
   - `@Android` / `@iOS`
   - `@Istanbul` / `@Ankara` / `@Izmir` / `@Diger`

#### B) Facebook Grupları (Duyuru için hazırlık)
- [ ] Şu gruplara üye ol / duyuru hazırla:
  - İstanbul Etkinlikleri
  - Ankara Üniversite Öğrencileri (varsa)
  - İzmir'de Yaşayanlar
  - Expats in Istanbul (yabancı kullanıcılar için)
  - Startup Türkiye / Teknoloji grupları

#### C) Reddit Hazırlığı
- [ ] r/Turkey, r/istanbul, r/ankara, r/izmir
- [ ] r/androiddev, r/playmygame, r/SaaS
- [ ] Gönderi taslağı hazırla (moderatör kurallarına uygun)

---

### ADIM 4: Test Kullanıcısı Toplama (Gün 1-3)

#### Gün 1: Hızlı Kanallar (Ücretli)
- [ ] Upwork ilanını yayınla (15 tester arıyoruz)
- [ ] Bionluk ilanını yayınla (15 tester arıyoruz)
- [ ] Fiverr'dan 3-5 satıcıya doğrudan mesaj at
- [ ] PrimeTestLab'e teklif iste (yedek plan)

#### Gün 2: Başvuruları Değerlendirme
- [ ] Upwork başvurularını incele
- [ ] Bionluk başvurularını incele
- [ ] Her adaydan: Gmail adresi, şehir, Android versiyonu, telefon modeli iste
- [ ] En az 18 kişi seç (15 hedef + 3 yedek)

#### Gün 3: Play Console Davetiyeleri
- [ ] Seçilen 18 kişinin Gmail adresini Play Console kapalı teste ekle
- [ ] Herkese Discord davet linki gönder
- [ ] Test kuralları PDF/DM gönder:
  - Her gün uygulamayı aç
- [ ] 14 gün boyunca aktif kal
- [ ] Bug bulursa Discord #hata-raporlari kanalına yaz
- [ ] Haftada 1 kez kısa geri bildirim formu doldur

---

### ADIM 5: 14 Günlük Test Süreci Yönetimi (Gün 4-17)

#### Günlük Kontrol Listesi (Her gün 5 dakika)
- [ ] Play Console → Statistics → Active testers (12+ aktif mi?)
- [ ] Discord'da yeni hata raporu var mı?
- [ ] Pasifleşen tester var mı? → DM hatırlatması gönder
- [ ] Günlük aktif kullanıcı sayısını not et (Google Play sıfırlanmasın)

#### Haftalık Görevler
- [ ] **Hafta 1 (Gün 7):** Küçük bir güncelleme yayınla (bug fix) → Google'a aktif test sinyali
- [ ] **Hafta 2 (Gün 14):** Test tamamlandıktan sonra Play Console anketini doldur
- [ ] **Gün 14:** Tüm testerlara teşekkür mesajı + ödemeleri yap

#### Riskler & Yedek Planlar
| Risk | Olasılık | Çözüm |
|------|----------|-------|
| 12 aktif kullanıcı düşer | Orta | 18 kişi başlat, 3 yedek hazır tut |
| Tester uygulamayı açmaz | Yüksek | Günlük Discord hatırlatması, $5 bonus aktif kullanıcılara |
| Play Console onay reddeder | Düşük | Anketi dikkatli doldur, güncelleme yayınla |
| iOS TestFlight hâlâ hazır değil | Yüksek | iOS testini sonraki aşamaya bırak |

---

### ADIM 6: Organik Beta Başlatma (Gün 14+, Google Play onayı sonrası)

#### Google Play Açık Test (Open Testing)
- [ ] Kapalı test başarılı → Açık teste geçiş
- [ ] Herkese açık test linki oluştur
- [ ] Facebook gruplarında duyuru yap
- [ ] Reddit gönderileri yayınla

#### iOS TestFlight (Code signing çözülünce)
- [ ] GitHub Actions code signing düzelt
- [ ] TestFlight public link oluştur
- [ ] iOS testerları Discord'a çek

#### Discord Topluluğu Genişletme
- [ ] Facebook/Reddit'ten gelen kullanıcıları Discord'a davet et
- [ ] Haftalık feedback toplantıları düzenle
- [ ] Aktif testerlara ödül/ücretsiz sürüş kredisi ver

---

## 💰 BÜTÇE TAHMİNİ

| Kalem | Maliyet | Not |
|-------|---------|-----|
| Bionluk (15 tester × ₺150) | ₺2,250 | Yerel, güvenilir |
| Upwork (3 yedek tester × $30) | ~$90 | Yedek güvenlik |
| PrimeTestLab (yedek) | $150-300 | En kötü senaryo |
| Discord Nitro (opsiyonel) | $10/ay | Sunucu boost |
| **Toplam (Bionluk + Upwork)** | ~₺3,000 + $90 | En makul plan |
| **Toplam (PrimeTestLab tek başına)** | $150-300 | En hızlı ama pahalı |

---

## 📅 HIZLI TAKVİM (ÖNERİLEN)

| Gün | Görev | Platform |
|-----|-------|----------|
| **Bugün (Gün 0)** | Play Console kontrolü, platform üyelikleri | Upwork, Bionluk, Fiverr, Discord |
| **Gün 1** | İlanları yayınla | Upwork, Bionluk |
| **Gün 2** | Başvuruları değerlendir | Tümü |
| **Gün 3** | Play Console davetiyeleri gönder | Play Console |
| **Gün 4-17** | 14 günlük test süreci | Play Console, Discord |
| **Gün 7** | Güncelleme yayınla | Play Console |
| **Gün 14** | Test tamamla, ödemeleri yap | Tümü |
| **Gün 15+** | Organik beta başlat | Facebook, Reddit, Discord |

---

## ⚡ HIZLI BAŞLANGIÇ: Bugün Yapılacaklar (Öncelikli)

1. **Play Console'a giriş yap** → Kapalı test track'i kontrol et
2. **Bionluk'a üye ol** → İlanı yayınla (en hızlı yerel kaynak)
3. **Discord sunucusu kur** → Kanalları oluştur, davet linki al
4. **Upwork'te işveren kaydı** → İlanı hazırla, yarın yayınla

**Hazırsan bu adımların ilkini birlikte başlatabilirim.** Play Console'a giriş bilgilerinle erişim sağlayıp kontrol edebilir miyim? Yoksa sen kontrol edip sonucu paylaşır mısın?

---

## 📎 EK: Hazır Şablonlar

### Test Davetiyesi (Email/Discord DM)
```
Merhaba! GetDriver beta test programına hoş geldin. 🚗

GOOGLE PLAY DAVETİYEN: [Play Console davet linki]
Kabul et → Uygulamayı indir → Her gün aç ve kullan

DISCORD: [Discord davet linki]
Hata bulursan #hata-raporlari kanalına yaz

KURALLAR:
- 14 gün boyunca her gün uygulamayı aç
- Kayıt ol, sürücü çağırma akışını dene
- Haftada 1 kez kısa geri bildirim ver
- 14. gün sonunda ödemen yapılacak

Soruların için Discord'dan ulaşabilirsin.
```

### Geri Bildirim Formu (Haftalık)
```
GetDriver Haftalık Geri Bildirim - Hafta [1/2]

1. Uygulamayı günde kaç kez açtın? (0-10+)
2. Karşılaştığın hatalar: [Açık alan]
3. En çok beğendiğin özellik: [Açık alan]
4. En çok zorlandığın yer: [Açık alan]
5. 1-10 arası puan verir misin? [ ]
6. Bir arkadaşına önerir misin? [Evet/Hayır]
```
