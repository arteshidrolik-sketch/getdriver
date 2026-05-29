# 🚀 GitHub Actions ile iOS Build Rehberi

## Özet
GitHub Actions **ücretsiz** macOS runner'ları var! 
- **Public repo:** Tamamen ücretsiz, limitsiz
- **Private repo:** Ayda 2,000 dakika ücretsiz
- macOS runner: $0.062/dakika (ücretsiz kotadan düşer)

---

## ✅ Avantajlar

1. **Ücretsiz** - Public repo'da limitsiz
2. **Kolay** - Her push'ta otomatik build
3. **Xcode hazır** - `macos-latest` runner'da yüklü
4. **Artifact** - Build çıktısını indir

---

## 📁 Oluşturulan Dosya

`.github/workflows/ios-build.yml` - GitHub Actions workflow dosyası

---

## 🚀 Nasıl Çalışır

### Adım 1: Manuel Tetikle (Şimdi)
GitHub'da:
1. Repo'ya git: https://github.com/arteshidrolik-sketch/getdriver
2. **Actions** sekmesine tıkla
3. Sol tarafta **iOS Build** göreceksin
4. **Run workflow** butonuna tıkla
5. **Run workflow** seçeneğini tekrar tıkla

### Adım 2: Build'i İzle
- Build ~5-10 dakika sürer
- Yeşil tik = başarılı
- Kırmızı çarpı = hata (logları kontrol et)

### Adım 3: Artifact İndir
Build tamamlanınca:
1. Workflow run'a tıkla
2. En altta **Artifacts** bölümü
3. **ios-build** dosyasını indir

---

## ⚠️ ÖNEMLİ: Sertifika ve Signing

Bu workflow **simulator build** yapıyor. Gerçek cihaz/App Store için:

### Gerekenler
1. Apple Developer hesabı ($99/yıl)
2. iOS Distribution sertifikası
3. Provisioning profile

### GitHub Secrets Ekle
Repo → Settings → Secrets and variables → Actions → New repository secret

```
APPLE_CERTIFICATE_BASE64: (sertifikanın base64 hali)
APPLE_CERTIFICATE_PASSWORD: (sertifika şifresi)
APPLE_PROVISIONING_PROFILE_BASE64: (profil base64)
APPLE_KEY_ID: (App Store Connect Key ID)
APPLE_ISSUER_ID: (App Store Connect Issuer ID)
APPLE_API_KEY_BASE64: (API key base64)
```

---

## 🔧 İleri Seviye: App Store Yükleme

Workflow'a ekle:
```yaml
    - name: Sign and Export IPA
      run: |
        cd ios/App
        # Sertifika ve profil ayarla
        # IPA oluştur
        
    - name: Upload to App Store Connect
      run: |
        xcrun altool --upload-app \
          --type ios \
          --file "GetDriver.ipa" \
          --apiKey "$APPLE_KEY_ID" \
          --apiIssuer "$APPLE_ISSUER_ID"
```

---

## 📊 Fiyatlandırma

| Plan | Ücretsiz Dakika | macOS Ücreti |
|------|----------------|--------------|
| GitHub Free (Public) | Limitsiz | Ücretsiz |
| GitHub Free (Private) | 2,000 dk/ay | $0.062/dk |
| GitHub Pro | 3,000 dk/ay | $0.062/dk |

**Tahmini maliyet:** Bir build ~10 dk = $0.62

---

## ❓ SSS

**Q: Build ne kadar sürer?**
~5-10 dakika

**Q: Her push'ta build olur mu?**
Evet, `on: push` ayarıyla

**Q: Manuel tetikleyebilir miyim?**
Evet, Actions sekmesinden "Run workflow"

**Q: IPA oluşturur mu?**
Şu an sadece simulator build. Sertifika eklenince IPA.

---

## 🎯 Hemen Başla

1. GitHub'a git: https://github.com/arteshidrolik-sketch/getdriver/actions
2. **iOS Build** workflow'unu bul
3. **Run workflow** butonuna tıkla
4. Build'i izle
5. Artifact'ı indir

---

Hazırlayan: OpenClaw | Tarih: 2026-05-29
