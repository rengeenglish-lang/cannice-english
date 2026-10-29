/**
 * Keep false until the prizes below are real offers. Turning it on shows the popup to every visitor.
 */
export const WHEEL_ENABLED = false;

/**
 * Prizes on the spin-the-wheel popup. Every slice is a promise: the winning slice is recorded
 * against the visitor's email, so each prize must be one you will actually honor. Replace the
 * placeholders below with current campaigns before the popup goes live.
 */
export const WHEEL_PRIZES = [
  { id: "discount-10", label: "%10", title: "%10 indirim", color: "#7c3aed" },
  { id: "discount-15", label: "%15", title: "%15 indirim", color: "#2563eb" },
  { id: "free-lesson", label: "Ücretsiz ders", title: "Bir ücretsiz ders", color: "#f97316" },
  { id: "discount-20", label: "%20", title: "%20 indirim", color: "#7c3aed" },
  { id: "ebook", label: "E-kitap", title: "Bir e-kitap", color: "#2563eb" },
  { id: "discount-5", label: "%5", title: "%5 indirim", color: "#f97316" },
] as const;

export type WheelPrize = (typeof WHEEL_PRIZES)[number];
