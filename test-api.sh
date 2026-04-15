#!/bin/bash
# GetDriver API Test Script
# Bu script API endpointlerini test eder

BASE_URL="https://getdriver-qnhegql34-arteshidrolik-sketchs-projects.vercel.app"

echo "=========================================="
echo "GetDriver API Test Script"
echo "=========================================="
echo ""

# Test 1: Ana sayfa
echo "1. Ana Sayfa Kontrolü"
echo "----------------------"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\nContent-Type: %{content_type}\n" "$BASE_URL/"
echo ""

# Test 2: Kayıt sayfası
echo "2. Kayıt Sayfası Kontrolü"
echo "----------------------"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" "$BASE_URL/kayit"
echo ""

# Test 3: Sürücü kayıt sayfası
echo "3. Sürücü Kayıt Sayfası Kontrolü"
echo "----------------------"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" "$BASE_URL/surucu-ol"
echo ""

# Test 4: Giriş sayfası
echo "4. Giriş Sayfası Kontrolü"
echo "----------------------"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" "$BASE_URL/giris"
echo ""

# Test 5: Müşteri paneli (giriş gerektirir - redirect beklenir)
echo "5. Müşteri Paneli Kontrolü (Giriş Gerektirir)"
echo "----------------------"
curl -s -L -o /dev/null -w "HTTP Status: %{http_code}\n" "$BASE_URL/musteri"
echo ""

# Test 6: Sürücü paneli (giriş gerektirir - redirect beklenir)
echo "6. Sürücü Paneli Kontrolü (Giriş Gerektirir)"
echo "----------------------"
curl -s -L -o /dev/null -w "HTTP Status: %{http_code}\n" "$BASE_URL/surucu"
echo ""

# Test 7: API signup endpoint (OPTIONS)
echo "7. API Signup Endpoint Kontrolü"
echo "----------------------"
curl -s -X OPTIONS -o /dev/null -w "HTTP Status: %{http_code}\n" "$BASE_URL/api/signup"
echo ""

# Test 8: API signup - Müşteri kaydı testi
echo "8. Müşteri Kaydı API Testi"
echo "----------------------"
TEST_PHONE="555$(date +%s | tail -c 8)"
TEST_RESULT=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$TEST_PHONE\",\"name\":\"Test Musteri API\",\"password\":\"Test1234!\",\"role\":\"CUSTOMER\"}" \
  "$BASE_URL/api/signup")
echo "Telefon: $TEST_PHONE"
echo "Yanıt: $TEST_RESULT"
echo ""

# Test 9: API signup - Sürücü kaydı testi
echo "9. Sürücü Kaydı API Testi"
echo "----------------------"
TEST_PHONE2="555$(date +%s | tail -c 8)"
TEST_RESULT2=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$TEST_PHONE2\",\"name\":\"Test Surucu API\",\"password\":\"Test1234!\",\"role\":\"DRIVER\"}" \
  "$BASE_URL/api/signup")
echo "Telefon: $TEST_PHONE2"
echo "Yanıt: $TEST_RESULT2"
echo ""

# Test 10: Aynı telefonla tekrar kayıt (hata beklenir)
echo "10. Çift Kayıt Kontrolü (Hata Beklenir)"
echo "----------------------"
TEST_RESULT3=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$TEST_PHONE\",\"name\":\"Test Tekrar\",\"password\":\"Test1234!\",\"role\":\"CUSTOMER\"}" \
  "$BASE_URL/api/signup")
echo "Yanıt: $TEST_RESULT3"
echo ""

echo "=========================================="
echo "API Testleri Tamamlandı"
echo "=========================================="
