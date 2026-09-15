import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/nav/Navbar";
import { Footer } from "@/components/nav/Footer";

const bodyFont = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: { default: "Cannice English — IELTS, TOEFL, PTE, YDS ve YÖKDİL Online Dersler", template: "%s | Cannice English" },
  description: "Tek öğretmenle, kayıtlı ve canlı derslerle IELTS, TOEFL, PTE, YDS ve YÖKDİL sınavlarına hazırlanın.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={bodyFont.variable}>
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
