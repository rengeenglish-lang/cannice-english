# Phase 3 — editorial intelligence, first increment

Baseline: Phase 2 deployed to production as e260539 on 2026-10-04.

Implemented:
- Admin-only topic map groups actual active keywords by exam, locale, market and intent and links their existing article workspaces. Missing briefs are visible; no invented search-demand data.
- Draft-level recommendations use inventory title-token matches and actual exam relationships. Known different languages/exams, private/deleted entries, self-links and unsafe URLs are excluded. Access requirements, unknown language and inventory scan date remain visible.
- Possible title overlap is explained with matching words. It is an editorial warning, not semantic similarity or measured Google cannibalization.
- Live exam/topic routes are now eligible for the existing CTA selector, which formerly only accepted PUBLISHED entries.
- All new reads check current active-admin authorization. No new tables, migrations, paid API, external crawling, content mutation or publication.
- Analysis is bounded to 2,000 records; beyond that it explicitly declines to show partial results.

Validation: 11 local SEO tests, lint and TypeScript pass. Browser CI extends the established manual-editor journey to the new panel and mobile topic map.

Remaining Phase 3 scope: curated pillar/supporting-page relationships, persisted link approval/insertion, live source revalidation, broader body/intent similarity and optional media workflow. This increment must not be represented as full semantic clustering or completed TrySoro parity. Recommendations reflect the last inventory refresh, not a live URL probe. Existing plain-text blog rendering is preserved.

## Completion — manual editorial scope

The follow-up completes saved link approvals, curated pillar/supporting-page relationships and current-source validation. Approved link plans are stored on SeoArticleDraft (one additive JSONB migration); the bounded topic configuration reuses versioned AppSetting storage. Both use active-admin authorization, transaction locks, revision checks, rate limits and audit events.

Recommendations now recheck the top 24 candidate source records. Saving and reviewing links rechecks all selected destinations; unpublished, deleted or renamed sources fail closed. The check is against database records and the curated route registry, not an external HTTP availability probe. CTA selection uses the same resolver. Review fingerprints include the approved links; changes invalidate review. The manual prompt receives the approved destinations, and the editor renders their safe link preview.

Cluster editing supports create, rename, remove, pillar selection and supporting pages. Self-support and duplicate IDs are rejected. Stale destinations are flagged when reopening the map. Configurations are capped at 100 clusters / 200 distinct destinations, and UI choices are capped at 200 plus current selections.

Internal-link publication/insertion into public articles belongs to Phase 4's native publisher. This phase saves an explicit editorial plan; it does not mutate published articles. Optional media remains Phase 4. Semantic embeddings and measured Google cannibalization are not claimed: the manual no-API scope retains explainable lexical and intent grouping. These replace the earlier increment's outstanding scope notes above.

Validation: 13 local SEO tests pass, including new permission, stale revision, duplicate, unpublished/renamed destination, published-draft protection and audit coverage. Browser verification now saves approved links and persists/reloads/removes a topic cluster. Release CI must pass before merge.
