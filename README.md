# GetDriver 🚗

GetDriver, müşterileri sürücülerle buluşturan bir sürücü talep platformudur. Next.js 14, Prisma ORM ve NextAuth.js üzerine inşa edilmiştir.

---

## 🚀 Vercel'e Deploy Etme

### 1. Gereksinimler

- Node.js 18+
- PostgreSQL veritabanı (örn: Neon, Supabase, Railway)
- Google Cloud Console hesabı (OAuth + Maps)
- AWS S3 bucket (dosya yükleme)
- Vercel hesabı

---

### 2. Google OAuth Ayarları

1. [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services → Credentials** adresine gidin
2. **Create Credentials → OAuth 2.0 Client IDs** seçin
3. Application type: **Web application**
4. **Authorized JavaScript origins** kısmına ekleyin:
   - `https://your-domain.vercel.app`
   - `http://localhost:3000` (geliştirme için)
5. **Authorized redirect URIs** kısmına ekleyin:
   - `https://your-domain.vercel.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (geliştirme için)
6. `GOOGLE_CLIENT_ID` ve `GOOGLE_CLIENT_SECRET` değerlerini kopyalayın

---

### 3. Environment Variables

`.env.example` dosyasını kopyalayın:

```bash
cp .env.example .env.local
```

Aşağıdaki değişkenleri doldurun:

| Değişken | Açıklama | Örnek |
|---|---|---|
| `DATABASE_URL` | PostgreSQL bağlantı URL'si | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_URL` | Uygulamanın tam URL'si | `https://getdriver.vercel.app` |
| `NEXTAUTH_SECRET` | NextAuth için rastgele secret | `openssl rand -base64 32` ile üretin |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Google Console'dan |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API Key | Maps JS + Directions + Places etkinleştirin |
| `AWS_REGION` | AWS bölgesi | `us-east-1` |
| `AWS_BUCKET_NAME` | S3 bucket adı | `getdriver-uploads` |
| `AWS_ACCESS_KEY_ID` | AWS erişim anahtarı | IAM kullanıcısından |
| `AWS_SECRET_ACCESS_KEY` | AWS gizli anahtarı | IAM kullanıcısından |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push public key | `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | Web Push private key | `npx web-push generate-vapid-keys` |
| `ILETIMERKEZI_API_KEY` | SMS OTP için API key | İleti Merkezi panelinden |
| `ILETIMERKEZI_API_HASH` | SMS OTP için hash | İleti Merkezi panelinden |
| `ILETIMERKEZI_SENDER_ID` | SMS gönderici adı | `getdriver` |

---

### 4. Veritabanı Kurulumu

```bash
# Şemayı veritabanına uygula
npx prisma migrate deploy

# Prisma client'ı oluştur
npx prisma generate

# (Opsiyonel) Seed verisi ekle
npm run db:seed
```

---

### 5. Vercel'e Deploy

#### Yöntem A: Vercel CLI

```bash
# Vercel CLI kur
npm i -g vercel

# Deploy et
vercel

# Üretim deploy'u
vercel --prod
```

#### Yöntem B: GitHub entegrasyonu

1. Projeyi GitHub'a push edin
2. [vercel.com](https://vercel.com) → **New Project** → GitHub repo'yu seçin
3. **Framework Preset:** Next.js (otomatik algılanır)
4. **Build Command:** `npx prisma generate && next build`
5. Environment variables'ları Vercel dashboard'dan girin
6. **Deploy** butonuna tıklayın

---

### 6. Deploy Sonrası Yapılacaklar

1. Vercel'den atanan domain'i öğrenin (ör: `getdriver-xxx.vercel.app`)
2. `NEXTAUTH_URL` değişkenini bu domain ile güncelleyin
3. Google OAuth'ta redirect URI'ı bu domain ile güncelleyin:
   - `https://getdriver-xxx.vercel.app/api/auth/callback/google`
4. Vercel dashboard → Settings → Environment Variables'a gidin, `NEXTAUTH_URL`'yi güncelleyin
5. Redeployment yapın (otomatik tetiklenir)

---

## 💻 Yerel Geliştirme

```bash
# Bağımlılıkları kur
npm install

# Prisma client oluştur
npx prisma generate

# Veritabanı migration
npx prisma migrate dev

# Geliştirme sunucusunu başlat
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

---

## 🏗️ Proje Yapısı

```
getdriver/
├── app/                  # Next.js App Router
│   ├── api/              # API route'ları
│   │   ├── auth/         # NextAuth + özel auth
│   │   ├── rides/        # Yolculuk yönetimi
│   │   ├── maps/         # Harita API'si
│   │   └── ...
│   ├── admin/            # Admin paneli
│   ├── musteri/          # Müşteri arayüzü
│   ├── surucu/           # Sürücü arayüzü
│   └── giris/            # Giriş sayfası
├── components/           # Yeniden kullanılabilir bileşenler
├── lib/                  # Yardımcı kütüphaneler
├── prisma/               # Veritabanı şeması
├── public/               # Statik dosyalar
└── vercel.json           # Vercel yapılandırması
```

---

## 🔧 Teknik Stack

- **Framework:** Next.js 14 (App Router)
- **Auth:** NextAuth.js v4 (Google OAuth + Credentials)
- **ORM:** Prisma 6 (PostgreSQL)
- **UI:** Tailwind CSS + Radix UI
- **Haritalar:** Google Maps API + Mapbox GL
- **Depolama:** AWS S3
- **Bildirimler:** Web Push (VAPID)
- **SMS:** İleti Merkezi (OTP)
# Trigger deploy
