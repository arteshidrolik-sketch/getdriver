# ☁️ GetDriver - Cloud (Claude Code) Geçiş Rehberi

> **Hazırlayan:** OpenClaw terminal oturumu
> **Tarih:** 17 Haziran 2026
> **Hedef:** Bu repo'yu Claude Code ile açıp devam edebilmek

---

## 1. Claude Code ile Repo'yu Açma

```bash
# Terminalde:
claude /home/ubuntu/getdriver-github

# Veya VS Code → Claude Code extension → Open Folder
```

---

## 2. GitHub Auth (Push gerekiyorsa)

Claude Code IDE'de push doğrudan çalışır (IDE auth'u kullanır).
Terminalden push gerekiyorsa:

```bash
# GitHub CLI ile (önerilen):
gh auth login

# Veya GitHub'dan yeni Personal Access Token (classic) al:
# Settings → Developer settings → Personal access tokens → Tokens (classic)
# → Generate new token → repo scope → token kopyala

# Geçici URL ile push:
# git remote set-url origin https://USERNAME:TOKEN@github.com/arteshidrolik-sketch/getdriver.git
# git push origin main
# git remote set-url origin https://github.com/arteshidrolik-sketch/getdriver.git  # token sil
```

---

## 3. Claude Code'a Önce Okutulması Gereken Dosyalar

| Dosya | Neden? |
|-------|--------|
| `GetDriver-Proje-Arsivi.md` | Tüm proje geçmişi, hatalar, çözümler, kararlar |
| `GetDriver-Test-Hareket-Plani.md` | Test kullanıcıları, senaryolar, hata kayıtları |
| `README.md` | Genel proje açıklaması, build komutları |
| `.env.example` | Gereken env değişkenleri (değerleri boş şablonsal) |
| `capacitor.config.ts` | iOS/Android native config |
| `codemagic.yaml` | iOS CI/CD pipeline (Codemagic) |
| `docs/APPSTORE-CHECKLIST.md` | iOS yayına alma adım adım |
| `docs/PLAY-CONSOLE-GUIDE.md` | Android güncelleme rehberi |

---

## 4. Proje Yapısı

```
getdriver-github/
├── app/              # Next.js 14 App Router (müşteri, sürücü, admin)
├── components/       # UI components
├── lib/              # Auth, DB, S3, SMS, push, maps
├── prisma/           # Schema + migrations
├── public/           # Statik dosyalar
├── scripts/          # Seed, test, migration scripts
├── ios/              # Capacitor iOS projesi (App Store build)
├── android-twa/      # Android TWA kaynak (Play Store)
├── docs/             # Play Store / App Store rehberleri
├── .env.example      # Env şablonu
├── .env.local        # Lokal dev değerleri (safe, no secrets)
├── GetDriver-Proje-Arsivi.md      # ← TÜM PROJE HAFIZASI
├── GetDriver-Test-Hareket-Plani.md # ← TEST PLANLARI
└── CLOUD-SETUP.md    # ← Bu dosya
```

---

## 5. Önemli Teknik Kararlar

- **Auth:** NextAuth v4 + Telefon/Şifre (Google OAuth kaldırıldı)
- **DB:** PostgreSQL (Neon hosted) → Prisma ORM
- **Maps:** Google Maps API + Mapbox GL (React Map GL)
- **Push:** Firebase Cloud Messaging (FCM) + Web Push (VAPID)
- **SMS:** İleti Merkezi (OTP)
- **Payment:** PayTR (test modunda)
- **Hosting:** Vercel
- **Android:** Bubblewrap TWA (Play Store: com.getdriver.app)
- **iOS:** Capacitor + Codemagic CI/CD (build hazır, App Store'da değil)

### Test Hesapları
| Rol | Telefon | Şifre |
|-----|---------|-------|
| Sürücü | 05057157353 | Ay151819 |
| Müşteri | 05321110001 | Test1234! |

### Canlı
- Site: https://www.getdriver.com.tr
- Android: com.getdriver.app (Play Store)
- iOS: com.getdriver.app (Xcode archive hazır, App Store'da değil)

---

## 6. Claude Code Hızlı Start Prompt

```
GetDriver projesi Türkiye'nin güvenli şoför platformu. Next.js 14 + Prisma + PostgreSQL + NextAuth.

Önce şu dosyaları oku:
1. GetDriver-Proje-Arsivi.md - Tüm proje geçmişi ve kararlar
2. GetDriver-Test-Hareket-Plani.md - Test planı ve kullanıcılar
3. .env.example - Gereken env değişkenleri

Proje yapısı:
- app/ → Next.js App Router (müşteri, sürücü, admin paneli)
- lib/ → Auth, DB, S3, SMS, Push, Maps
- prisma/ → Schema + migrations
- ios/ → Capacitor iOS projesi (App Store build hazır)
- android-twa/ → Android TWA kaynak (Play Store'da yayında)
- docs/ → Yayınlama rehberleri

Test hesapları: 05057157353/Ay151819 (sürücü), 05321110001/Test1234! (müşteri)
```
