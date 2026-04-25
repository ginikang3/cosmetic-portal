import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Diagnóstico de Piel K-Beauty | Encuentra tu Rutina Ideal",
  description: "Descubre el mejor producto de K-Skincare para tu piel con nuestro test gratuito. ¡Obtén un 5% de descuento hoy!",
  keywords: ["K-beauty", "Skincare Coreano", "Cuidado de la piel", "Diagnóstico de piel", "Rutina facial"],
  alternates: {
    canonical: "https://cosmetic-portal.vercel.app",
  },
  // 구글 서치 콘솔 소유권 인증 태그 추가
  verification: {
    google: "n0h7YBDy8iiuMhb1xrE4NYG3wWCD66K11XfK0bNBRT4",
  },
  openGraph: {
    title: "Diagnóstico de Piel K-Beauty",
    description: "Encuentra tu match ideal de K-Skincare en 30 segundos.",
    url: "https://cosmetic-portal.vercel.app",
    siteName: "NuriGlow K-Skincare",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Diagnóstico de Piel K-Beauty",
    description: "Encuentra tu rutina coreana ideal y obtén un cupón de descuento.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}