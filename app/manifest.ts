import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Netfener — İngilizce Sınav Hazırlık",
    short_name: "Netfener",
    description: "IELTS, TOEFL, PTE, YDS ve YÖKDİL hazırlığı: konu anlatımları, deneme sınavları ve ücretsiz öğrenci koçluğu.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f9ff",
    theme_color: "#132f59",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
