/**
 * Prizes on the spin-the-wheel popup. Every slice is a promise: the winning slice is recorded
 * against the visitor's email, so each prize must be one you will actually honor. Free-access
 * prizes must be granted in the account system; the wheel only records them.
 */
export const WHEEL_PRIZES = [
  { id: "discount-15", label: "%15", title: "%15 indirim", color: "#7c3aed" },
  { id: "free-1-month", label: "1 ay ücretsiz", title: "1 ay ücretsiz erişim", color: "#2563eb" },
  { id: "free-2-months", label: "2 ay ücretsiz", title: "2 ay ücretsiz erişim", color: "#f97316" },
  { id: "discount-30", label: "%30", title: "%30 indirim", color: "#2563eb" },
  { id: "full-access", label: "Tam erişim", title: "Kitaplar hariç tüm siteye %100 erişim", color: "#7c3aed" },
] as const;

export type WheelPrize = (typeof WHEEL_PRIZES)[number];
