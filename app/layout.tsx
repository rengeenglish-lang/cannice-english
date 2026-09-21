import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/nav/Navbar";
import { Footer } from "@/components/nav/Footer";
import { getSiteUrl } from "@/server/env";

const bodyFont = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "600", "700", "800"] });

const title = "Cannice English — IELTS, TOEFL, PTE, YDS ve YÖKDİL Online Dersler";
const description = "Tek öğretmenle, kayıtlı ve canlı derslerle IELTS, TOEFL, PTE, YDS ve YÖKDİL sınavlarına hazırlanın.";

// No logo/banner image exists in the repo yet (public/ is empty), so Open Graph previews are
// text-only for now — still a real improvement over no tags at all, but add an `images` entry
// here once a real graphic exists.
export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: title, template: "%s | Cannice English" },
  description,
  openGraph: { title, description, type: "website", locale: "tr_TR", siteName: "Cannice English" },
  twitter: { card: "summary", title, description },
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
