# Phase 8 — competitive intelligence (manual, no scraping)

Migration `20261010000100_seo_competitors` (additive: `seo_competitors`, `seo_competitor_topics`, `seo_serp_results`). No environment variables. Stacked on Phase 7.

## What it is — and is not
The tool **never fetches competitor sites, never stores article text and never copies content.** Everything comes from data an administrator types or pastes: competitor domains, topic titles with an optional URL on that competitor's domain, and the top results seen for a tracked keyword. Matching is lexical word overlap (explainable, not semantic) and says nothing about search demand.

## Delivered (`/admin/seo/competitors`)
- **Competitor configuration:** add/pause/remove (max 20; own site and IPs/localhost rejected; domain normalized from URLs).
- **Topic import:** one `Title | https://competitor.com/page` per line, up to 500 per competitor; foreign-host URLs, too-short lines and duplicates are dropped and counted.
- **Content gaps:** competitor topics where no Netfener page (live inventory titles) contains ≥60% of the topic's meaningful words; grouped across competitors (more competitors = higher), shows the nearest Netfener page and overlap, flags topics already tracked, and one click adds a gap to the keyword list (language/market from SEO settings, intent unknown, **no invented demand**).
- **SERP records:** for a tracked keyword, enter the top results in order; the summary shows domains by how many keywords they appear for, best/average rank, and labels Netfener, configured competitors, generic platforms (YouTube, Wikipedia…) and **competitor candidates** (frequent unknown domains). SERP rows entered before a competitor existed are linked when it is added later.
- **Differentiation prompt in the brief form:** reminds writers to name what Netfener can offer that results don't (interactive practice, level test, mock exams, sample questions, teacher explanation, downloads, study plan, progress tracking).

## Not built
Automated competitor discovery, rank tracking, keyword-volume or difficulty data, semantic similarity, backlink analysis — all need a paid data provider/API you would have to choose and license. Stored competitor data is an editorial record you maintain; it goes stale.

## Validation (local)
33/33 SEO tests on this branch (4 new: parsing/validation, gap logic, SERP summary, full workflow with permissions/limits/linking/tracking/removal). No migration drift, lint, TypeScript, build; competitors page renders.
