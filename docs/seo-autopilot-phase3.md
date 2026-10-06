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
