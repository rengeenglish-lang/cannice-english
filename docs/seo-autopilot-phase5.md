# Phase 5 — performance (Search Console snapshots, quick wins, decay, refresh)

Stacked on Phase 4. No paid API. Nothing here changes public pages or publishes content.

## Delivered
- **Snapshots** (`seo_search_snapshots` / `seo_search_rows`, migration `20261007000200_seo_search_performance`): one immutable-per-period snapshot per kind (PAGES, QUERIES, PAGE_QUERIES). Re-importing the same kind+period replaces it (audited). Page URLs are reduced to site paths; foreign hosts, impossible rows (clicks > impressions, bad CTR) and duplicates are dropped and counted, never guessed. Limits: 93-day period, no future dates, 20,000 rows, 2 MB CSV.
- **Two ingestion paths**: manual CSV import of a Search Console export (works today, EN/TR number formats, `,`/`;` delimiters, positional columns), and a Search Console API client (service account JWT, paging, refuses partial snapshots, no secrets or response bodies in errors). The API path is **unavailable until you set** `GSC_SERVICE_ACCOUNT_JSON` and `GSC_SITE_URL` (`sc-domain:example.com` or `https://example.com/`) on the server and add the service-account e-mail as a user on the Search Console property. It is tested against a mocked HTTP layer only — **never run against Google**. Manual trigger; no cron.
- **Quick Wins** (`/admin/seo/quick-wins`): position 5–20 with ≥100 impressions. Position ≤10 with CTR under half of an editorial expected-CTR-by-position table → improve title/meta; page two → expand + internal links. Ranked by estimated click gap. Also lists untracked queries (≥100 impressions, not in the keyword list) as content-gap candidates. The CTR table is a rough heuristic, not Google data.
- **Content decay**: latest snapshot vs the equal-length period immediately before it. Signals: clicks −30% (prior ≥30 clicks), impressions −30% (prior ≥500), CTR −30% relative, position worse by ≥3. Pages below the evidence thresholds never alert; HIGH needs clicks −50% and ≥2 signals. Shown on `/admin/seo/performance`.
- **Refresh recommendations** (`/admin/seo/refresh`): UPDATE (decay), RE-TITLE and EXPAND/ADD INTERNAL LINKS (quick wins), EXPAND for blog posts under 300 words, ADD INTERNAL LINKS when inventory shows none. Links to the studio draft when the page is an SEO-studio article.

## Not implemented (stated honestly)
REWRITE, MERGE, IMPROVE CTA, outdated-information and new-tool detection (need semantic analysis / Phase 6 conversion data); scheduled auto-sync; query-level decay; position/CTR trend charts. Search Console data lags 2–3 days and is sampled/anonymized by Google. Snapshot rows hold queries (not personal data) but your privacy notice should mention Search Console use.

## Validation (local)
22/22 SEO tests (5 new: CSV/URL validation, quick-win examples from the brief and thin-data guards, decay thresholds and period comparability, JWT signature verification/paging/partial refusal/secret hygiene, DB import/replace/authorization/report). No migration drift; lint, TypeScript, production build pass. The three pages rendered with seeded data via authenticated HTTP. The Playwright journey was not extended for this phase.

## Environment
Optional: `GSC_SERVICE_ACCOUNT_JSON`, `GSC_SITE_URL`. Unset = integration shown as not connected.
