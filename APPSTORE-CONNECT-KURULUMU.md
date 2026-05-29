# 🍎 App Store Connect Kurulum Rehberi

## Adım 1: App Store Connect API Key Oluştur

### 1.1. App Store Connect'e Git
https://appstoreconnect.apple.com/

### 1.2. Users and Access
- Sol menüden **Users and Access**'e tıkla
- Üst sekmeden **Keys**'e tıkla
- **App Store Connect API** sekmesini seç

### 1.3. API Key Oluştur
- **Request Access** (ilk kez kullanıyorsan)
- **Generate API Key** veya **+** butonuna tıkla
- **Key Name**: `getdriver-ci`
- **Access**: **Admin** (veya en az App Manager)
- **Generate** butonuna tıkla

### 1.4. Bilgileri Kaydet
Aşağıdaki bilgileri bir yere kaydet (bir daha gösterilmeyecek!):

| Bilgi | Açıklama | Örnek |
|-------|----------|-------|
| **Key ID** | Key'in ID'si | `ABCD123456` |
| **Issuer ID** | Hesap ID'si | `12345678-1234-1234-1234-123456789abc` |
| **.p8 dosyası** | Private key dosyası | `AuthKey_ABCD123456.p8` |

**ÖNEMLİ:** `.p8` dosyasını hemen indir, bir daha indiremezsin!

---

## Adım 2: App Store'da Uygulama Oluştur

### 2.1. My Apps
https://appstoreconnect.apple.com/apps

### 2.2. Yeni Uygulama
- **+** butonuna tıkla → **New App**
- **Platform**: iOS
- **App Name**: GetDriver
- **Primary Language**: Turkish
- **Bundle ID**: `com.getdriver.app` (önce oluşturmalısın)
- **SKU**: `getdriver-2024`
- **User Access**: Full Access

### 2.3. Bundle ID Oluşturma (Eğer yoksa)
https://developer.apple.com/account/resources/identifiers/list/bundleId

- **Identifiers** → **App IDs** → **+**
- **Description**: GetDriver
- **Bundle ID**: `com.getdriver.app`
- **Capabilities**: Push Notifications (işaretle)

---

## Adım 3: GitHub Secrets Ekle

GitHub repo'sunda şu secrets'ları ekle:

https://github.com/arteshidrolik-sketch/getdriver/settings/secrets/actions

| Secret Name | Değer |
|-------------|-------|
| `APPSTORE_ISSUER_ID` | Issuer ID |
| `APPSTORE_KEY_ID` | Key ID |
| `APPSTORE_PRIVATE_KEY` | .p8 dosyasının içeriği (tam metin) |
| `APPLE_TEAM_ID` | Apple Developer Team ID |

### Team ID Bulma:
https://developer.apple.com/account → Membership details → Team ID

---

## Adım 4: Bana Bilgileri Ver

Aşağıdaki bilgileri bana yaz:

```
Issuer ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Key ID: XXXXXXXXXX
Team ID: XXXXXXXXXX
.p8 içeriği:
-----BEGIN EC PRIVATE KEY-----
...
-----END EC PRIVATE KEY-----
```

Ben workflow'u güncelleyeceğim ve gerçek cihaz build'i + TestFlight'a otomatik yükleme yapacağım.

---

## ⚠️ Güvenlik Notu

- Bu bilgileri sadece bana ver
- İşlem bitince GitHub secrets'ta güvenli kalacak
- .p8 dosyasını asla public repo'ya koyma
- Token'ı sadece bu session için kullanacağım

---

Hazırlayan: OpenClaw | Tarih: 2026-05-29
