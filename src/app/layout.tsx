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
  title: "Samparka | ସମ୍ପର୍କ – The Voice of Odisha",
  description: "Odisha's most trusted newspaper. Breaking news, politics, business, sports, and culture in Odia and English.",
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
      <body>
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
