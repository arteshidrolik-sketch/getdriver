import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold mb-8">Kullanım Şartları</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-muted-foreground">Son güncelleme: 9 Şubat 2026</p>

          <h2>1. Hizmetin Kapsamı</h2>
          <p>
            GetDriver, araç sahipleri ile profesyonel sürücüleri buluşturan bir pazar yeri platformudur. 
            Platform, sürücülerin müşterilerin araçlarını kullanarak müşterileri istedikleri adrese 
            güvenli bir şekilde ulaştırmasını sağlar.
          </p>

          <h2>2. Kullanıcı Sorumlulukları</h2>
          <h3>2.1 Müşteri Sorumlulukları</h3>
          <ul>
            <li>Doğru ve güncel bilgi sağlamak</li>
            <li>Araç ruhsatına sahip olmak</li>
            <li>Hizmet bedelini zamanında ödemek</li>
            <li>Araç teslim protokolüne uymak</li>
          </ul>

          <h3>2.2 Sürücü Sorumlulukları</h3>
          <ul>
            <li>Geçerli B sınıfı ehliyet sahibi olmak</li>
            <li>Adli sicil kaydı bulunmamak</li>
            <li>Güvenli sürüş kurallarına uymak</li>
            <li>Fotoğraflı teslim protokolünü uygulamak</li>
          </ul>

          <h2>3. Ödeme Koşulları</h2>
          <p>
            Tüm ödemeler uygulama üzerinden yapılır. Platform %20 komisyon alır. 
            Sürücü payı haftalık veya anlık olarak ödenir.
          </p>

          <h2>4. İptal ve İade Politikası</h2>
          <ul>
            <li>Sürücü gelmeden iptal: Ücretsiz</li>
            <li>Sürücü yola çıktıktan sonra iptal: Minimum ücret</li>
            <li>Uyuşmazlık durumunda admin incelemesi</li>
          </ul>

          <h2>5. Sorumluluk Reddi</h2>
          <p>
            GetDriver bir aracı platform olup, sürüş sırasında oluşabilecek 
            kazalar veya araç hasarlarından doğrudan sorumlu değildir. 
            Kullanıcıların kendi sigorta poliçelerini kontrol etmeleri önerilir.
          </p>

          <h2>6. İletişim</h2>
          <p>
            Sorularınız için: destek@getdriver.com.tr
          </p>
        </div>
      </main>
    </div>
  );
}