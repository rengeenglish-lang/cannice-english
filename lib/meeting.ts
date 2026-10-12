/**
 * Each live lesson gets its own Jitsi room unless the admin pastes another link: a readable name
 * plus a random suffix, so the room can't be guessed and lessons never share a meeting.
 */
const ROOM_BASE = "https://meet.jit.si/";

function slug(text: string) {
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .normalize("NFKD").replace(/[^\w\s-]/g, "")
    .trim().replace(/[\s_-]+/g, "-")
    .slice(0, 40)
    .replace(/-+$/, "");
}

export function newMeetingUrl(title: string, startsAt: Date) {
  const day = startsAt.toISOString().slice(0, 10).replace(/-/g, "");
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  const suffix = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${ROOM_BASE}netfener-${slug(title) || "ders"}-${day}-${suffix}`;
}
