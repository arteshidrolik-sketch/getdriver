# 🍎 GetDriver iOS - Mac Olmadan Build Alternatifleri

## Durum
- MacBook Air A1466 (2017) → Max macOS Monterey (12.x)
- Xcode 15+ gerekiyor → macOS Sonoma (14.x) gerekiyor
- **Sonuç: Mevcut Mac uygun değil ❌**

---

## ALTERNATİF 1: Codemagic (Önerilen - Ücretsiz Başlangıç)

**Web:** https://codemagic.io

### Avantajlar
- ✅ Ücretsiz: Ayda 500 macOS M2 dakika
- ✅ Mac'e ihtiyaç yok
- ✅ Capacitor/ionic desteği var
- ✅ Otomatik App Store yükleme
- ✅ GitHub entegrasyonu

### Fiyatlandırma
- **Ücretsiz:** 500 macOS dakika/ay (yeterli)
- **Ücretli:** $0.095/dakika (M2)

### Nasıl Çalışır
1. GitHub repo'yu Codemagic'a bağla
2. `codemagic.yaml` dosyası ekle
3. Apple Developer sertifikalarını yükle
4. Build tetikle → `.ipa` oluşur
5. Otomatik App Store Connect'e yükle

---

## ALTERNATİF 2: Capawesome Cloud

**Web:** https://cloud.capawesome.io

### Avantajlar
- ✅ Capacitor için özel yapılmış
- ✅ CLI'dan tek komutla build
- ✅ M4 Pro donanım
- ✅ TestFlight otomatik yükleme

### Fiyatlandırma
- Ücretsiz deneme var
- Ücretli planlar mevcut

### CLI Komutu
```bash
npx @capawesome/cli apps:builds:create \
  --app-id <APP_ID> \
  --platform ios \
  --path ./ios \
  --ipa
```

---

## ALTERNATİF 3: GitHub Actions + Mac Stadium

### Avantajlar
- ✅ GitHub'ta her şey
- ✅ Otomatik CI/CD

### Dezavantajlar
- ❌ Mac Stadium ücretli ($99/ay)
- ❌ Kurulum karmaşık

---

## ALTERNATİF 4: Yeni Mac Al / Kirala

### Mac Kiralama
- **MacinCloud:** Saatlik/aylık kiralama
- **MacStadium:** Aylık $99'dan başlar

### Yeni Mac Önerileri
- **Mac mini M2:** ~$600 (en ucuz)
- **MacBook Air M1/M2:** ~$900
- **MacBook Air M3:** ~$1100

---

## ✅ ÖNERİLEN YOL: Codemagic (Ücretsiz)

### Adım 1: GitHub Repo Hazırla
```bash
cd /home/ubuntu/getdriver-github
# Değişiklikleri commit et
git add .
git commit -m "iOS Capacitor build hazırlığı"
git push origin main
```

### Adım 2: Codemagic'a Kaydol
- https://codemagic.io adresine git
- GitHub hesabınla giriş yap

### Adım 3: Proje Ekle
- "Add Application" → GitHub → getdriver repo

### Adım 4: codemagic.yaml Ekle
Repo'ya şu dosyayı ekle:

```yaml
workflows:
  ios-build:
    name: iOS Build
    instance_type: mac_mini_m2
    max_build_duration: 30
    environment:
      vars:
        BUNDLE_ID: "com.getdriver.app"
      ios_signing:
        distribution_type: app_store
        bundle_identifier: com.getdriver.app
    scripts:
      - name: Install dependencies
        script: |
          npm install
      - name: Build web
        script: |
          npm run build
      - name: Sync Capacitor
        script: |
          npx cap sync ios
      - name: Build iOS
        script: |
          cd ios/App
          xcodebuild -workspace App.xcworkspace \
            -scheme App \
            -configuration Release \
            -archivePath $CM_BUILD_DIR/GetDriver.xcarchive \
            archive
      - name: Export IPA
        script: |
          xcodebuild -exportArchive \
            -archivePath $CM_BUILD_DIR/GetDriver.xcarchive \
            -exportPath $CM_BUILD_DIR/ipa \
            -exportOptionsPlist $CM_BUILD_DIR/export_options.plist
    artifacts:
      - build/ios/ipa/*.ipa
    publishing:
      app_store_connect:
        api_key: $APP_STORE_CONNECT_KEY
        key_id: $APP_STORE_CONNECT_KEY_ID
        issuer_id: $APP_STORE_CONNECT_ISSUER_ID
        submit_to_testflight: true
```

### Adım 5: Apple Developer Sertifikaları
1. Apple Developer Portal'dan sertifika oluştur
2. Codemagic'a yükle (Settings → iOS Code Signing)

### Adım 6: App Store Connect API Key
1. App Store Connect → Users and Access → Keys
2. API Key oluştur
3. Codemagic'a ekle

### Adım 7: Build Tetikle
- Codemagic'da "Start new build" butonu
- Veya GitHub'a push yapınca otomatik

---

## ⚡ HIZLI BAŞLANGIÇ

1. **GitHub repo'yu hazırla** (yukarıdaki değişikliklerle)
2. **Codemagic'a kaydol** (ücretsiz)
3. **Repo'yu bağla**
4. **Build tetikle**
5. **TestFlight'a yüklensin**

---

## 📋 GEREKLİLER

- [ ] Apple Developer hesabı ($99/yıl)
- [ ] GitHub repo (hazır)
- [ ] Codemagic hesabı (ücretsiz)
- [ ] App Store Connect API Key
- [ ] iOS Distribution Sertifikası

---

Hazırlayan: OpenClaw | Tarih: 2026-05-29
