import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0ea5e9",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://www.getdriver.com.tr"),
  title: "GetDriver - Güvenli Sürücü Hizmeti",
  description: "Aracınızı ve sizi güvenle eve ulaştırıyoruz. Türkiye'nin güvenilir designated driver platformu.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GetDriver",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "GetDriver - Güvenli Sürücü Hizmeti",
    description: "Aracınızı ve sizi güvenle eve ulaştırıyoruz.",
    images: ["/icons/icon-512x512.png"],
    type: "website",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: "GetDriver - Güvenli Sürücü Hizmeti",
    description: "Aracınızı ve sizi güvenle eve ulaştırıyoruz.",
    images: ["/icons/icon-512x512.png"],
  },
  applicationName: "GetDriver",
  keywords: ["şoför", "designated driver", "güvenli sürüş", "araç", "taksi", "ulaşım", "türkiye"],
  authors: [{ name: "GetDriver" }],
  creator: "GetDriver",
  publisher: "GetDriver",
  category: "transportation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
        {/* PWA - iOS Safari specific */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GetDriver" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        {/* Splash screens for iOS */}
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#0ea5e9" />
        <meta name="msapplication-TileImage" content="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('SW registration failed:', error);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}