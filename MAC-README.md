# 🍎 GetDriver iOS - Mac'te Yapılacaklar

## Hazırlık
Bu zip dosyasını Mac'e aktar ve aç:
```bash
unzip getdriver-ios.zip
cd ios/App
```

---

## ADIM 1: Xcode ile Aç

```bash
open App.xcodeproj
```

---

## ADIM 2: Xcode Ayarları

### 2.1 Signing & Capabilities
- Sol taraftan **App** seç (en üstteki mavi ikon)
- **Signing & Capabilities** sekmesine git
- **Team** alanına Apple Developer hesabını seç
  - Hesap yoksa: Xcode → Preferences → Accounts → Apple ID ekle

### 2.2 Bundle Identifier
Zaten ayarlı olmalı:
```
com.getdriver.app
```

### 2.3 Version
- **Version**: 1.0.0
- **Build**: 1

---

## ADIM 3: Icon Kontrolü

`Assets.xcassets/AppIcon.appiconset`'e git:
- 1024x1024 icon zaten yerleştirildi ✅

---

## ADIM 4: Build & Archive

### 4.1 Simulator'da Test (İsteğe Bağlı)
```
Product → Run
```

### 4.2 Archive Oluştur
```
Product → Archive
```

### 4.3 App Store'a Yükle
Archive oluştuktan sonra:
```
Window → Organizer → Archive → Distribute App → App Store Connect → Upload
```

---

## ADIM 5: App Store Connect (Web)

https://appstoreconnect.apple.com

### 5.1 Yeni Uygulama
- **My Apps** → **+** → **New App**
- Platform: iOS
- Name: GetDriver
- Primary Language: Turkish
- Bundle ID: com.getdriver.app
- SKU: getdriver-ios-001

### 5.2 Store Listing Doldur
- Screenshots (iPhone 6.7", 6.5", 5.5")
- Description, Keywords, Support URL
- App Privacy (Data Types)

### 5.3 Build'i Seç
- **TestFlight** tab → Yüklenen build'i gör
- **App Store** tab → Build'i seç → Submit for Review

---

## ⚠️ ÖNEMLİ NOTLAR

### Capacitor Uygulaması
Bu bir Capacitor uygulamasıdır - web sitenin native iOS wrapper'ıdır.
- Web içerik: `App/public/` klasöründe
- Güncellemeler web'den gelir, store review gerektirmez

### TestFlight
- Internal testing ile kendi telefonunda test et
- External testing için Apple review gerekir

### Inceleme Süresi
- İlk uygulama: 5-7 gün
- Güncellemeler: 1-2 gün

---

Hazırlayan: OpenClaw | Tarih: 2026-05-29
