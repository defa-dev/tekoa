import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Providers } from "./providers";
import "./globals.css";

/**
 * Adumu — fonte de título (display). Auto-hospedada via next/font/local,
 * então não depende de rede no build e não causa layout shift.
 */
const adumu = localFont({
  src: "../public/fonts/Adumu.ttf",
  variable: "--font-adumu",
  display: "swap",
});

const adumuInline = localFont({
  src: "../public/fonts/Adumu-Inline.ttf",
  variable: "--font-adumu-inline",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tekoa — Trocas e economia solidária no seu bairro",
  description:
    "Tekoa é a roda da sua comunidade: troque serviços, compre e venda na Feira do Rolo e acompanhe os avisos do bairro.",
  applicationName: "Tekoa",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tekoa",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#b8342a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${adumu.variable} ${adumuInline.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-creme text-tinta font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
