import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

const WIDTH = 1200;
const HEIGHT = 630;
let fontPromise: Promise<Buffer> | undefined;
const loadFont = () => (fontPromise ??= readFile(path.join(process.cwd(), "lib/fonts/Geist-Regular.ttf")));

/** Title size shrinks as the headline grows so it always fits in at most four lines. */
export function coverFontSize(title: string) {
  const n = title.length;
  return n <= 38 ? 84 : n <= 60 ? 72 : n <= 85 ? 62 : n <= 110 ? 54 : 46;
}

type El = { type: string; props: { style?: Record<string, string | number>; children?: unknown } };
const el = (type: string, style: Record<string, string | number>, children?: unknown): El => ({ type, props: { style, children } });

/** Branded 1200x630 article cover in Netfener's ink-navy and gold: wordmark, exam label and the headline. */
export async function renderCover(input: { title: string; label: string }) {
  const tree = el("div", {
    width: WIDTH, height: HEIGHT, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 80px",
    backgroundImage: "linear-gradient(135deg, #0f131c, #243052)", color: "#ffffff", fontFamily: "Geist", position: "relative",
  }, [
    el("div", { position: "absolute", top: -160, right: -120, width: 520, height: 520, borderRadius: 260, background: "#f2c14e", opacity: 0.09 }),
    el("div", { position: "absolute", left: 0, top: 0, bottom: 0, width: 14, background: "#f2c14e" }),
    el("div", { display: "flex", alignItems: "center", justifyContent: "space-between" }, [
      el("div", { fontSize: 34, letterSpacing: 6, color: "#f2c14e" }, "NETFENER"),
    ]),
    el("div", { display: "flex", fontSize: coverFontSize(input.title), lineHeight: 1.12, letterSpacing: -1.5, maxWidth: 1040, lineClamp: 4 }, input.title),
    el("div", { display: "flex" }, [
      el("div", { display: "flex", fontSize: 26, letterSpacing: 2, padding: "10px 24px", borderRadius: 999, background: "#f2c14e", color: "#161b26" }, input.label),
    ]),
  ]);
  const font = await loadFont();
  const response = new ImageResponse(tree as never, { width: WIDTH, height: HEIGHT, fonts: [{ name: "Geist", data: font, weight: 400, style: "normal" }] });
  return Buffer.from(await response.arrayBuffer());
}
