import { permanentRedirect } from "next/navigation";

/** The old "Soru & Cevap" page grew into the Yardım Masası; keep the URL working. */
export default function FaqPage() {
  permanentRedirect("/yardim");
}
