import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/nav/Navbar";
import { Footer } from "@/components/nav/Footer";
import { LiveChatWidget } from "@/components/support/LiveChatWidget";
import { PaletteSwitcher } from "@/components/theme/PaletteSwitcher";
import { getSiteUrl } from "@/server/env";

// Inter (variable) with Latin Extended for Turkish characters (ğ, ş, ı, İ).
const bodyFont = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-body", display: "swap" });

/**
 * Applies the saved theme (or the device preference) before the first paint, so dark-mode
 * visitors never see a white flash, and the colour-switcher palette, so a chosen colour never flashes
 * green first. Kept tiny and dependency-free; ThemeToggle and PaletteSwitcher update them later.
 */
const THEME_SCRIPT = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}d.dataset.theme=t;var p=localStorage.getItem("palette");if(p==="blue"||p==="purple"||p==="orange"||p==="red")d.dataset.palette=p}catch(e){d.dataset.theme="light"}})()`;

const title = "Netfener — IELTS, TOEFL, PTE, YDS ve YÖKDİL Online Dersler";
const description = "Tek öğretmenle, kayıtlı ve canlı derslerle IELTS, TOEFL, PTE, YDS ve YÖKDİL sınavlarına hazırlanın.";

// No logo/banner image exists in the repo yet (public/ is empty), so Open Graph previews are
// text-only for now — still a real improvement over no tags at all, but add an `images` entry
// here once a real graphic exists.
export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: title, template: "%s | Netfener" },
  description,
  openGraph: { title, description, type: "website", locale: "tr_TR", siteName: "Netfener" },
  twitter: { card: "summary", title, description },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={bodyFont.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <Navbar />
        {children}
        <Footer />
        <LiveChatWidget />
        <PaletteSwitcher />
      </body>
    </html>
  );
}
