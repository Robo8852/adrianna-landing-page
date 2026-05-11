import type { Metadata } from "next";
import { Cormorant_Garamond, EB_Garamond } from "next/font/google";
import "./globals.css";
import { HeaderNav } from "@/components/chrome/HeaderNav";
import { Footer } from "@/components/chrome/Footer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-eb-garamond",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Altar Within — Adrianna Naílah",
  description:
    "Transpersonal & Integration Psychotherapy with Adrianna Naílah. Reflections, practices, and announcements.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${ebGaramond.variable}`}>
      <body>
        <HeaderNav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
