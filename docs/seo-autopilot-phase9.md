# Phase 9 — Claude-written articles (assisted generation and gated autopilot)

No schema migration. Environment: `ANTHROPIC_API_KEY`, `SEO_AI_INPUT_USD_PER_MTOK`, `SEO_AI_OUTPUT_USD_PER_MTOK` (see `.env.example`).
Everything stays off until the owner turns it on: the provider setting, a monthly budget above $0, the key and prices, and the two
switches on the Otomasyon page (**Otomatik makale üretimi** and **Puanı geçen yazıları otomatik yayınla**).

## What it does
- **One paid call per article** (`lib/seo/autopilot.ts`, `server/seo/claude.ts`, `server/services/seo/autopilot.service.ts`): Claude returns the
  brief and the article together as a structured tool result. The call is guarded by the existing AI budget ledger (`reserveAiBudget` →
  `settleAiUsage` / `releaseAiUsage`); a cap of 0 means no spending. `tool_choice` is `auto` because some models reject a forced tool.
- **Same pipeline as a human draft**: the brief and text are saved with `createSeoDraft`, `saveSeoBrief` and `saveSeoDraftContent`, so version history,
  slug-redirect protection and revision checks all apply. An existing draft with text is never overwritten.
- **Unattended publishing is the same publish gate, with no override** (`autoPublishSeoDraft`): every gate check, the minimum checklist score from
  Ayarlar, plus extra checks for unattended use (headline ≤ 75 characters, no markup/links/asterisks, no references to other Netfener articles that may
  not exist, at least one `##` heading). Only after the gate passes does it record an automated review and approval (`DRAFT_AUTO_APPROVED`, never
  a human fact-check attestation) and publish (`ARTICLE_PUBLISHED`, origin `AUTOPILOT`). Daily and weekly publish limits still apply.
- **A draft that does not pass is saved for a human** with the reasons in `scheduleError` and an `AUTOPILOT_NEEDS_REVIEW` entry.
- **Jobs**: new `GENERATE_ARTICLE` job. The planner (`planGenerationJobs`, runs from the existing every-3-hours `/api/cron/seo-jobs`) queues the oldest
  keywords without a draft, never beyond the daily/weekly limits, honouring excluded keywords/topics and enabled exams. Permanent errors (no budget,
  bad request, invalid model output) fail the job on the first attempt; only transient errors (429/5xx/network) retry with backoff.
- **Emergency stop** halts planning and running; it never unpublishes anything.
- **Bulk keyword import** on Anahtar kelimeler: `anahtar kelime | amaç | sınav | not` per line (max 60), validated like the single form.
- **Article text format**: plain text with optional `## Başlık` lines and `- ` lists; the public article page renders those two and leaves everything else as paragraphs.

## Links to courses and books, covers, and search data (Phase 9b)
- **Related pages and a call to action.** The prompt offers up to 10 real, currently published pages (books and packages, exam pages, topic pages, blog posts,
  a few tool pages), ranked by exam match and words in common, each re-validated against the live database (`research.service.ts`). The model may only choose
  from that list (`selectLinks` drops anything else); a call to action must be a product, exam or topic page and may not mention prices, discounts or
  promises. The article text never contains links. The chosen pages are stored as the draft's approved links and brief CTA, so the existing publish gate
  re-checks them, and the public article page resolves them again when it renders (a page that disappears simply stops being shown).
- **Cover image.** `/blog/<slug>/cover` renders a 1200x630 PNG on demand (ink-navy and gold, headline, exam label) with Geist (`lib/fonts`), cached by the CDN.
  Used as the article image, the Open Graph/Twitter image and in the JSON-LD; an article's own `coverImageUrl` still wins. No image storage is needed.
- **Search data.** The latest Search Console `QUERIES` snapshot (queries sharing at least half of the keyword's words, most-seen first), competitor topic titles
  and recorded results (`SeoSerpResult`) are added to the prompt as ideas only: the model must not quote the numbers or copy competitor titles. Empty data adds nothing.
- Photographs/illustrations inside articles are still not generated (it would need an image provider, an extra key and per-image cost).

## Limits (be honest about them)
- The checklist score is editorial hygiene, not accuracy, originality or ranking. Exam rules, scores and dates must still be checked by a person; the prompt
  forbids inventing them, and the brief records what an editor should verify (`sources`).
- No search-volume, difficulty or competitor data feeds topic choice; keywords come from the owner's list.
- Articles are plain text; related pages and the call to action appear in blocks under the article, not inside the text.
- Daily cron: runs at most two jobs per invocation; a generation takes about a minute.

## Tests
`tests/seo-claude-autopilot.test.ts` (12): slugs, prices and cost math, request shape, schema/repair/quality checks, prompts, bulk parsing, and against the
database with a fake Claude: publish + cost settlement + audit trail, parking when automatic publishing is off or a check fails, budget/provider/permanent-error
stops with reservations released, planner limits and order, runner stop and fail-fast, and keyword import. Note: `npm test` runs files in parallel and the SEO
tests share one database lock, so run them serially (`--test-concurrency=1`) if you see "Başka bir SEO işlemi sürüyor".
