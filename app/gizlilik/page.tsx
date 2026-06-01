import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold mb-8">Gizlilik Politikası (KVKK)</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-muted-foreground">Son güncelleme: 17 Şubat 2026</p>

          <h2>1. Veri Sorumlusu</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") ve Avrupa Birliği Genel 
            Veri Koruma Tüzüğü (GDPR) kapsamında, GetDriver olarak kişisel verilerinizin 
            güvenliğini en üst düzeyde korumayı taahhüt ediyoruz.
          </p>

          <h2>2. Toplanan Veriler</h2>
          <ul>
            <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, telefon numarası, e-posta adresi</li>
            <li><strong>Araç Bilgileri:</strong> Plaka, marka, model, renk, yıl</li>
            <li><strong>Konum Verileri:</strong> Sadece aktif sürüş sırasında (GPS koordinatları)</li>
            <li><strong>Sürücü Belgeleri:</strong> Ehliyet fotoğrafı, profil fotoğrafı, adli sicil beyanı</li>
            <li><strong>Ödeme Bilgileri:</strong> Sadece kart son 4 hanesi ve kart markası (tam kart numarası saklanmaz)</li>
          </ul>

          <h2>3. Verilerin İşlenme Amaçları</h2>
          <ul>
            <li>Hizmet sunumu ve müşteri-sürücü eşleştirmesi</li>
            <li>Güvenlik kontrolü ve kimlik doğrulama</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
            <li>Hizmet kalitesinin iyileştirilmesi (anonimleştirilmiş verilerle)</li>
          </ul>

          <h2>4. Veri Saklama Süreleri</h2>
          <ul>
            <li>Konum verileri: Sürüş tamamlandıktan 30 gün sonra anonimleştirilir</li>
            <li>Sürüş fotoğrafları: 90 gün sonra silinir (uyuşmazlık yoksa)</li>
            <li>Hesap verileri: Hesap silininceye kadar saklanır</li>
            <li>İletişim kayıtları: 1 yıl süreyle saklanır</li>
          </ul>

          <h2>5. Kullanıcı Hakları (KVKK Madde 11)</h2>
          <p>KVKK ve GDPR kapsamında aşağıdaki haklara sahipsiniz:</p>
          <ul>
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
            <li>İşleme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Eksik veya yanlış işlenen verilerin düzeltilmesini talep etme</li>
            <li>Verilerinizi indirme/taşıma (veri taşınabilirliği)</li>
            <li><strong>Hesabınızı ve tüm verilerinizi kalıcı olarak silme (unutulma hakkı)</strong></li>
            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
          </ul>
          <p className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <strong>Hesap Silme:</strong> Hesabınızı ve tüm kişisel verilerinizi silmek için 
            Profil {"->"} Hesabı Sil bölümünü kullanabilirsiniz. Silme işlemi geri alınamaz.
          </p>

          <h2>6. Veri Güvenliği</h2>
          <ul>
            <li>Tüm veriler şifrelenerek saklanır (AES-256)</li>
            <li>Tüm iletişim HTTPS/TLS 1.3 ile şifrelenir</li>
            <li>Kredi kartı bilgileri sistemimizde saklanmaz - PCI-DSS sertifikalı ödeme sağlayıcıları kullanılır</li>
            <li>CVV/CVC kodları hiçbir zaman saklanmaz</li>
            <li>Şifreler tek yönlü hash algoritmasıyla (bcrypt) korunur</li>
            <li>Brute force saldırılarına karşı rate limiting uygulanır</li>
          </ul>

          <h2>7. Üçüncü Taraflarla Paylaşım</h2>
          <p>Verileriniz yalnızca aşağıdaki durumlar için paylaşılabilir:</p>
          <ul>
            <li>Yasal zorunluluklar (mahkeme kararı, resmi kurum talepleri)</li>
            <li>Ödeme işlemcileri (sadece işlem için gerekli minimum bilgi)</li>
            <li>Harita servisleri (sadece konum bilgisi, kimlik bilgisi paylaşılmaz)</li>
          </ul>

          <h2>8. İletişim</h2>
          <p>
            KVKK kapsamındaki talepleriniz ve sorularınız için:<br />
            E-posta: <a href="mailto:destek@getdriver.com.tr" className="text-green-600">destek@getdriver.com.tr</a><br />
            Destek: <a href="mailto:destek@getdriver.com.tr" className="text-green-600">destek@getdriver.com.tr</a>
          </p>
        </div>
      </main>
    </div>
  );
}