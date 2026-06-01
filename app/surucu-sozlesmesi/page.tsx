import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DriverAgreementPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-green-600" />
            <span className="text-lg font-bold text-green-700">GetDriver</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Sürücü Sözleşmesi</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-muted-foreground">Son güncelleme: 9 Şubat 2026</p>

          <h2>1. Tanımlar</h2>
          <p>
            Bu sözleşmede "Sürücü", GetDriver platformunda hizmet veren 
            bağımsız yol arkadaşı hizmet sağlayıcısını ifade eder.
          </p>

          <h2>2. Katılım Koşulları</h2>
          <ul>
            <li>En az 2 yıllık B sınıfı ehliyet</li>
            <li>Adli sicil kaydı bulunmaması</li>
            <li>Geçerli profil fotoğrafı (yüz görünür)</li>
            <li>Ehliyet fotoğrafı ve onay</li>
          </ul>

          <h2>3. Hizmet Standartları</h2>
          <ul>
            <li>Profesyonel ve saygılı davranış</li>
            <li>Trafik kurallarına uyum</li>
            <li>Müşteri araçlarına özen</li>
            <li>Fotoğraflı teslim protokolüne uyum</li>
            <li>Alkol veya uyuşturucu etkisi altında sürüş yasak</li>
          </ul>

          <h2>4. Gelir ve Komisyon</h2>
          <ul>
            <li>Sürücü, müşteriden alınan ücretin %80'ini alır</li>
            <li>Platform %20 komisyon alır</li>
            <li>Ödemeler haftalık veya anlık yapılır</li>
            <li>Ödeme için banka hesap bilgisi gereklidir</li>
          </ul>

          <h2>5. Fotoğraflı Teslim Protokolü</h2>
          <p>Her sürüş öncesi ve sonrası:</p>
          <ul>
            <li>Aracın 4 köşesinden fotoğraf (ön sol, ön sağ, arka sol, arka sağ)</li>
            <li>Ön panel/kilometre fotoğrafı</li>
            <li>GPS koordinatlı ve zaman damgalı</li>
            <li>Müşteri onayı alınmalı</li>
          </ul>

          <h2>6. Sözleşmenin Feshi</h2>
          <ul>
            <li>Düşük puan ortalaması (3.5 altı)</li>
            <li>Kural ihlalleri</li>
            <li>Müşteri şikayetleri</li>
            <li>Sahte belge sunumu</li>
          </ul>

          <h2>7. İletişim</h2>
          <p>
            Sürücü desteği: destek@getdriver.com.tr
          </p>
        </div>
      </main>
    </div>
  );
}