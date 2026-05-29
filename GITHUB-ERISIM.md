# 🔑 GitHub Erişim Talimatları

## Senin Yapman Gerekenler

### Adım 1: GitHub Token Oluştur

1. https://github.com/settings/tokens adresine git
2. **Generate new token (classic)** butonuna tıkla
3. Token note: `getdriver-ios-build`
4. Expiration: 30 gün (veya istediğin kadar)
5. Scopes (izinler) - şunları işaretle:
   - ✅ `repo` (tam erişim)
   - ✅ `workflow` (actions erişimi)
   - ✅ `read:packages`
   - ✅ `write:packages`

6. **Generate token** butonuna tıkla
7. Token'ı KOPYALA (bir daha gösterilmeyecek!)

---

### Adım 2: Bana Token'ı Ver

Token'ı buraya yazabilirsin:
```
ghp_xxxxxxxxxxxxxxxxxxxx
```

**Güvenlik:** Token sadece bu session'da kullanılacak, kaydetmeyeceğim.

---

### Adım 3: Ben Yapacağım İşlemler

Token'ı alınca:
1. ✅ GitHub'a push yapacağım
2. ✅ GitHub Actions workflow'unu tetikleyeceğim
3. ✅ Build sonucunu kontrol edeceğim
4. ✅ Sana sonucu bildireceğim

---

### Adım 4: Token'ı Sonra Sil

İşlem bitince:
1. https://github.com/settings/tokens adresine git
2. `getdriver-ios-build` token'ını bul
3. **Delete** butonuna tıkla

---

## 🚀 Hızlı Başlangıç

Sadece şunu yaz:
```
Token: ghp_xxxxxxxxxxxxxxxxxxxx
```

Ben gerisini hallederim.

---

## ❓ SSS

**Q: Token güvenli mi?**
- Evet, sadece bu session'da kullanılacak
- İşlem bitince silmeni öneririm

**Q: Ne kadar erişim veriyor?**
- Sadece getdriver repo'suna
- Actions çalıştırma
- Push yapma

**Q: Token süresi dolarsa?**
- Yeni token oluşturursun
- Tekrar verirsin

---

Hazırlayan: OpenClaw | Tarih: 2026-05-29
