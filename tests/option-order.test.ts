import { test } from "node:test";
import assert from "node:assert/strict";
import { displayLetter, displayOptions, optionOrder, relabelExplanation } from "../lib/diagnostics/option-order";

const ids = Array.from({ length: 2000 }, (_, i) => `cm${(i * 7919).toString(36)}q${i}`);

test("option order is a stable permutation of every index", () => {
  for (const id of ids.slice(0, 200)) {
    for (const n of [2, 4, 5]) {
      const order = optionOrder(id, n);
      assert.deepEqual([...order].sort(), Array.from({ length: n }, (_, i) => i));
      assert.deepEqual(optionOrder(id, n), order);
    }
  }
});

test("an answer authored as option A lands on every letter about equally often", () => {
  for (const n of [4, 5]) {
    const counts = new Array(n).fill(0);
    for (const id of ids) counts[optionOrder(id, n).indexOf(0)]++;
    const expected = ids.length / n;
    for (const c of counts) assert.ok(Math.abs(c - expected) < expected * 0.15, `uneven spread ${counts.join(",")}`);
  }
});

test("display options keep the original index to submit and letter them in display order", () => {
  const options = ["right", "w1", "w2", "w3", "w4"];
  const shown = displayOptions("q-1", options);
  assert.deepEqual(shown.map((o) => o.letter), ["A", "B", "C", "D", "E"]);
  for (const o of shown) assert.equal(options[o.index], o.option);
  const right = shown.find((o) => o.index === 0)!;
  assert.equal(displayLetter("q-1", 5, 0), right.letter);
});

test("explanation letters follow the displayed order, with Turkish suffix harmony", () => {
  const id = ids.find((x) => optionOrder(x, 4)[0] !== 0 && optionOrder(x, 4).indexOf(0) !== 0)!;
  const letter = (original: number) => displayLetter(id, 4, original);
  const text = "Bu ikisini doğru veren tek seçenek A'dır. B yanlış zaman, C ve D anlamı bozar (A). 'A ---- speeds up' kalıbı da E'yi gerektirmez.";
  const out = relabelExplanation(id, 4, text);
  const a = letter(0);
  assert.ok(out.includes(`tek seçenek ${a}'${a === "A" ? "dır" : "dir"}.`), out);
  assert.ok(out.includes(`${letter(1)} yanlış zaman, ${letter(2)} ve ${letter(3)} anlamı`), out);
  assert.ok(out.includes(`(${a})`), out);
  // Quoted English and letters beyond the option count are left alone.
  assert.ok(out.includes("'A ---- speeds up'"), out);
  assert.ok(out.includes("E'yi"), out);
});

test("relabelling is a no-op when the order is the identity", () => {
  const id = ids.find((x) => optionOrder(x, 5).every((v, i) => v === i));
  if (!id) return;
  const text = "Doğru cevap C'dir; A ve B zamanı bozar.";
  assert.equal(relabelExplanation(id, 5, text), text);
});
