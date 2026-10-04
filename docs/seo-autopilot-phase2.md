# Phase 2 — manual content engine

Baseline: deployed main e5a032b. The approved roadmap has eight core phases; external CMS connectors are an additional parity extension.

## Agreed delivery

The user chose to use ChatGPT Plus manually rather than purchase API credits. This phase therefore provides a complete manual brief → copy prompt → paste draft → edit → check → review workflow. Provider-backed generation and API billing remain explicitly deferred and disabled. The interface does not claim to generate or research content automatically.

## Implementation

- Admin keyword creation, editing, archive/restore, locale/market uniqueness, recorded intent and research notes; validated current exam references, revision checks and audit history.
- Opportunities show a transparent editorial relevance score and related existing inventory pages. Search demand and ranking feasibility remain unknown. Similar titles raise a warning; semantic cannibalization detection remains Phase 3.
- Editable brand/audience/style configuration uses existing AppSetting storage with revisions.
- One article workspace per keyword. SeoArticleDraft stores workflow metadata, brief and review fingerprint, while the existing BlogPost remains the only article body store. Starting the same brief twice returns the existing workspace.
- Editable briefs capture reader, problem, goal, intent, language/market, title alternatives, outline, questions, differentiation, sources, word range and optional real inventory CTA. A complete brief is required before pasting a draft. Up to 200 catalogue choices are shown (plus an existing selected destination).
- Ready briefs produce a copyable prompt for manual use in ChatGPT. No browser or server request is made to ChatGPT or an AI provider. The prompt uses the curated selected destination and explicitly rejects fabricated facts/products, personal data and source-text instructions.
- Plain-text article editor and escaped preview match the existing blog renderer; HTML is never rendered. Separate title, slug, excerpt and SEO metadata fields are saved to BlogPost. URL uniqueness and both workspace revision and post timestamp protect against overwrites.
- Deterministic editorial checklist: word range, metadata, summary, topic presence, paragraph length, duplicate paragraphs, raw HTML/code blocks and placeholders. It is not an AI detector, fact checker or ranking prediction.
- Explicit editor factual-review confirmation records an audit event and content fingerprint. Article/brief edits invalidate review; even independent database edits change the fingerprint. Review does not publish.
- Studio-managed posts are excluded from the legacy staff blog editor and its mutations, preventing teachers or direct legacy actions from bypassing the admin-only workflow. Ordinary blog posts retain their prior behavior. Public draft metadata is now also hidden.
- List pagination, mobile cards, form pending states, accessible labels/statuses, admin/noindex boundaries and bounded payloads.

## Database and environment

Two additive migrations: 20261004000200_seo_keywords and 20261004000300_seo_manual_studio. Unique keys and foreign keys protect keyword/workspace/post identity. Keyword demand requires accompanying evidence if introduced later. No student records, payment records, fabricated SEO metrics or production example data are added.

New environment variables: none. Existing database and authentication configuration is reused. No new AI credentials or costs.

## Verification

Local isolated database migrations, lint and TypeScript pass. Nine SEO tests pass, covering access control including inactive admins, revisions, concurrency, deduplication, immutable source content, safe prompts, checklist behavior, URL collisions, manual state transitions, old editor bypass prevention, and no publishing. Production build and full desktop/mobile browser CI are release gates; final results are recorded below after execution.

## Boundaries

Paid AI integration, automatic SERP/intent research and metadata generation are not activated. No automatic publishing, scheduling, Search Console, measured demand or attribution. Native publishing/version history belongs to Phase 4; this phase's reviewed drafts remain private. To use the studio: Admin → SEO Autopilot → Keywords → Brief oluştur / aç, complete the brief, copy its ChatGPT prompt, paste the article, save and review.

## Final verification and release status

On 2026-10-04, GitHub Actions SEO run 37228356259 passed all checks, including the full desktop/mobile create-keyword → brief → copyable prompt → paste/edit → rejected duplicate-slug save → retained text → successful save → factual review flow. Draft database state and private metadata were checked. Desktop and mobile screenshots were visually reviewed. Checkout regression run 37228356251 also passed. The two accessible-label defects found by the first browser runs were fixed before these passing runs.

PR #24 is ready for review. It has not been merged or deployed: Vercel still reports resource provisioning failure, consistent with the previously confirmed Neon preview-branch limit. The user has been asked to remove the now-merged Phase 1 preview database `preview/feat/seo-autopilot-foundation`, preserving `main`, before another release attempt. Production remains Phase 1.
