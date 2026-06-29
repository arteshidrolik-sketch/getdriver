import Link from "next/link";
import { Shield, Car, Clock, Star, MapPin, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-green-700 dark:text-green-500">GetDriver</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/giris">
              <Button variant="ghost">Giriş Yap</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Aracınızı ve Sizi{" "}
              <span className="text-green-600">Güvenle</span>{" "}
              Eve Ulaştırıyoruz
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-8">
              Gece dışarı çıktınız ve araç kullanamayacak durumda mısınız? 
              Profesyonel sürücülerimiz sizi ve aracınızı güvenle evinize götürsün.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/kayit">
                <Button size="xl" className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                  <Car className="h-5 w-5 mr-2" />
                  Müşteri Ol
                </Button>
              </Link>
              <Link href="/surucu-ol">
                <Button size="xl" variant="outline" className="w-full sm:w-auto border-green-600 text-green-600 hover:bg-green-50">
                  Sürücü Ol
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nasıl Çalışır?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: MapPin,
                title: "Konum Belirle",
                desc: "Bulunduğunuz ve gitmek istediğiniz adresi girin",
              },
              {
                icon: Users,
                title: "Teklif Al",
                desc: "Yakınınızdaki sürücülerden teklifler alın",
              },
              {
                icon: CheckCircle2,
                title: "Sürücü Seç",
                desc: "Size uygun sürücüyü puan ve fiyata göre seçin",
              },
              {
                icon: Car,
                title: "Eve Varın",
                desc: "Sürücünüz sizi ve aracınızı güvenle eve götüsün",
              },
            ].map((step, i) => (
              <Card key={i} className="text-center border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <step.icon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-green-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Neden GetDriver?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Güvenli & Onaylı Sürücüler",
                desc: "Tüm sürücülerimiz ehliyet ve kimlik kontrolünden geçer",
              },
              {
                icon: Clock,
                title: "7/24 Hizmet",
                desc: "Gece gezi hayatınıza uygun, her saat hizmetinizdeyiz",
              },
              {
                icon: Star,
                title: "Puanlama Sistemi",
                desc: "Sürücüleri puanlayın, kaliteli hizmet alın",
              },
            ].map((feature, i) => (
              <Card key={i} className="border-0 shadow-lg bg-white dark:bg-gray-900">
                <CardContent className="pt-6">
                  <feature.icon className="h-12 w-12 text-green-600 mb-4" />
                  <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for Drivers */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Sürücü Olarak Kazanç Elde Edin</h2>
          <p className="text-lg opacity-90 mb-8">
            B sınıfı ehliyetiniz var mı? GetDriver ile esnek çalışma saatleriyle ek gelir elde edin.
          </p>
          <Link href="/surucu-ol">
            <Button size="xl" variant="secondary" className="bg-white text-green-700 hover:bg-green-50">
              Sürücü Başvurusu Yap
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-green-500" />
              <span className="text-white font-semibold">GetDriver</span>
            </div>
            <nav className="flex flex-wrap gap-6 text-sm">
              <Link href="/kullanim-sartlari" className="hover:text-white transition">
                Kullanım Şartları
              </Link>
              <Link href="/gizlilik" className="hover:text-white transition">
                Gizlilik Politikası
              </Link>
              <Link href="/surucu-sozlesmesi" className="hover:text-white transition">
                Sürücü Sözleşmesi
              </Link>
            </nav>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            © 2026 GetDriver. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}