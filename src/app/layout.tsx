import type { Metadata } from "next";
import { Playfair_Display, Source_Serif_4, Noto_Sans_Oriya } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const notoSansOriya = Noto_Sans_Oriya({
  variable: "--font-odia",
  subsets: ["oriya"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.samparka.online"),
  title: "Samparka | ସମ୍ପର୍କ – The Voice of Odisha",
  description: "Odisha's most trusted newspaper. Breaking news, politics, business, sports, and culture in Odia and English.",
  openGraph: {
    title: "Samparka | ସମ୍ପର୍କ – The Voice of Odisha",
    description: "Odisha's most trusted newspaper. Breaking news, politics, business, sports, and culture in Odia and English.",
    url: "https://www.samparka.online",
    siteName: "Samparka",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Samparka - The Voice of Odisha",
      },
    ],
    locale: "or_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Samparka | ସମ୍ପର୍କ – The Voice of Odisha",
    description: "Odisha's most trusted newspaper. Breaking news, politics, business, sports, and culture in Odia and English.",
    images: ["/og-default.png"],
  },
};

import { LanguageProvider } from "@/context/LanguageContext";
import { FloatingLanguageSelector } from "@/components/ui/FloatingLanguageSelector";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${sourceSerif.variable} ${notoSansOriya.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <AuthProvider>
          <LanguageProvider>
            {children}
            <FloatingLanguageSelector />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
