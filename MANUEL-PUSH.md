# 📤 Manuel Push Talimatları

## Durum
GitHub token'ın geçersiz olmuş. Manuel push yapman gerekiyor.

---

## Seçenek 1: GitHub Desktop veya Terminal'den Push

### Adım 1: GitHub'da Yeni Token Oluştur
1. https://github.com/settings/tokens adresine git
2. **Generate new token (classic)**
3. Scopes: `repo` (tam erişim)
4. Token'ı kopyala

### Adım 2: Local'de Push Yap
```bash
# Repo dizinine git
cd getdriver-github

# Token'ı ayarla
export GITHUB_TOKEN=ghp_YENI_TOKENIN_BURAYA

# Remote URL'i güncelle
git remote set-url origin https://arteshidrolik-sketch:${GITHUB_TOKEN}@github.com/arteshidrolik-sketch/getdriver.git

# Push yap
git push origin main
```

---

## Seçenek 2: GitHub Web'den Dosya Ekle

### Workflow Dosyasını Ekle
1. https://github.com/arteshidrolik-sketch/getdriver adresine git
2. **.github/workflows/** klasörüne git (yoksa oluştur)
3. **Add file** → **Create new file**
4. Dosya adı: `.github/workflows/ios-build.yml`
5. İçeriği aşağıdaki gibi yapıştır:

```yaml
name: iOS Build

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build-ios:
    runs-on: macos-latest
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build web app
      run: npm run build
      
    - name: Sync Capacitor iOS
      run: npx cap sync ios
      
    - name: Setup Xcode
      uses: maxim-lobanov/setup-xcode@v1
      with:
        xcode-version: latest-stable
        
    - name: Build iOS (Simulator)
      run: |
        cd ios/App
        xcodebuild -workspace App.xcworkspace \
          -scheme App \
          -configuration Release \
          -destination 'platform=iOS Simulator,name=iPhone 15' \
          clean build
          
    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: ios-build
        path: |
          ios/App/build/
        retention-days: 7
```

6. **Commit changes** → **Commit directly to main**

---

## Seçenek 3: GitHub CLI Kullan

```bash
# GitHub CLI yükle (eğer yoksa)
# brew install gh

# Login ol
gh auth login

# Repo'ya git
cd getdriver-github

# Push yap
git push origin main
```

---

## ✅ Sonraki Adımlar

Push başarılı olduktan sonra:

1. https://github.com/arteshidrolik-sketch/getdriver/actions adresine git
2. **iOS Build** workflow'unu gör
3. **Run workflow** butonuna tıkla
4. Build'i izle (~5-10 dk)
5. Artifact'ı indir

---

Hazırlayan: OpenClaw | Tarih: 2026-05-29
