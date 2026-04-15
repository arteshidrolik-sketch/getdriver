#!/bin/bash
# GetDriver Test Script - Manuel Test Rehberi
# Bu script browser kullanmadan test adımlarını raporlar

echo "=========================================="
echo "GetDriver İki Taraflı Test Raporu"
echo "=========================================="
echo ""
echo "Uygulama URL: https://getdriver-qnhegql34-arteshidrolik-sketchs-projects.vercel.app"
echo "Tarih: $(date)"
echo ""

# Uygulama erişilebilirlik kontrolü
echo "1. Uygulama Durumu Kontrolü"
echo "------------------------------"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://getdriver-qnhegql34-arteshidrolik-sketchs-projects.vercel.app)
if [ "$HTTP_STATUS" == "200" ]; then
    echo "✅ Uygulama erişilebilir (HTTP 200)"
else
    echo "❌ Uygulama erişilebilir değil (HTTP $HTTP_STATUS)"
fi
echo ""

# API endpoint kontrolü
echo "2. API Endpoint Kontrolü"
echo "------------------------------"
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://getdriver-qnhegql34-arteshidrolik-sketchs-projects.vercel.app/api/health 2>/dev/null || echo "404")
if [ "$API_STATUS" == "200" ]; then
    echo "✅ Health check endpoint aktif"
else
    echo "ℹ️  Health check endpoint yok veya erişilemiyor (HTTP $API_STATUS)"
fi
echo ""

# Test kullanıcı bilgileri
echo "3. Test Senaryoları"
echo "------------------------------"
echo ""
echo "📱 MÜŞTERİ (YOLCU) TEST KAYDI:"
echo "------------------------------"
echo "Kayıt URL: https://getdriver-qnhegql34-arteshidrolik-sketchs-projects.vercel.app/kayit"
echo ""
echo "Test Verileri:"
echo "  - Telefon: 5551234567"
echo "  - Ad Soyad: Test Musteri"
echo "  - Şifre: Test1234!"
echo ""
echo "Adımlar:"
echo "  1. Tarayıcıda kayıt sayfasını aç"
echo "  2. Telefon numarasını gir (5551234567)"
echo "  3. Ad soyad gir (Test Musteri)"
echo "  4. Şifre oluştur (en az 8 karakter, büyük/küçük harf, rakam)"
echo "  5. 'Kayıt Ol' butonuna tıkla"
echo "  6. Otomatik giriş yapıp müşteri paneline yönlendirmeli"
echo ""

echo "🚗 SÜRÜCÜ TEST KAYDI:"
echo "------------------------------"
echo "Kayıt URL: https://getdriver-qnhegql34-arteshidrolik-sketchs-projects.vercel.app/surucu-ol"
echo ""
echo "Test Verileri:"
echo "  - Telefon: 5559876543"
echo "  - Ad Soyad: Test Surucu"
echo "  - Şifre: Test1234!"
echo ""
echo "Adımlar:"
echo "  1. Tarayıcıda sürücü kayıt sayfasını aç"
echo "  2. Telefon numarasını gir (5559876543)"
echo "  3. Ad soyad gir (Test Surucu)"
echo "  4. Şifre oluştur"
echo "  5. 'Devam Et' butonuna tıkla"
echo "  6. 2. adımda belgeleri yükle:"
echo "     - Ehliyet fotoğrafı (zorunlu)"
echo "     - Profil fotoğrafı (opsiyonel)"
echo "     - Adli sicil kaydı (zorunlu)"
echo "  7. Adli sicil beyanını onayla"
echo "  8. 'Başvuruyu Gönder' butonuna tıkla"
echo ""

echo "🔐 GİRİŞ TESTİ:"
echo "------------------------------"
echo "Giriş URL: https://getdriver-qnhegql34-arteshidrolik-sketchs-projects.vercel.app/giris"
echo ""
echo "Adımlar:"
echo "  1. Giriş sayfasını aç"
echo "  2. Telefon ve şifre ile giriş yap"
echo "  3. Müşteri hesabı → /musteri paneline yönlendirmeli"
echo "  4. Sürücü hesabı → /surucu paneline yönlendirmeli"
echo ""

echo "4. Beklenen Sonuçlar"
echo "------------------------------"
echo "✅ Müşteri kaydı başarılı olmalı"
echo "✅ Sürücü kaydı başarılı olmalı (belgelerle birlikte)"
echo "✅ Giriş yapılabilmeli"
echo "✅ Rol bazlı yönlendirme çalışmalı"
echo ""

echo "5. Test Dosyaları"
echo "------------------------------"
echo "Test için sahte belgeler oluşturuluyor..."

# Test görselleri oluştur
mkdir -p /tmp/getdriver-test

# Sahte ehliyet görseli
curl -s "https://placehold.co/600x400/orange/white?text=Ehliyet+Test" -o /tmp/getdriver-test/ehliyet.jpg
# Sahte profil görseli  
curl -s "https://placehold.co/400x400/green/white?text=Profil+Test" -o /tmp/getdriver-test/profil.jpg
# Sahte adli sicil görseli
curl -s "https://placehold.co/600x400/blue/white?text=Adli+Sicil+Test" -o /tmp/getdriver-test/adli_sicil.jpg

echo "✅ Test dosyaları oluşturuldu:"
echo "   /tmp/getdriver-test/ehliyet.jpg"
echo "   /tmp/getdriver-test/profil.jpg"
echo "   /tmp/getdriver-test/adli_sicil.jpg"
echo ""

echo "=========================================="
echo "Test Raporu Tamamlandı"
echo "=========================================="
