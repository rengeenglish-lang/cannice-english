# Phase 6 — business intelligence (cookie-free conversion attribution)

Migration `20261008000100_seo_attribution` (additive: `seo_article_days`, `seo_attributions`). No new environment variables. First change to public pages in the SEO work: every blog article now has a signup button and a view beacon.

## How measurement works (and what it cannot see)
- **Views:** the article page sends one `POST /api/seo/view` per load. The server stores only a per-article, per-day count split into "from a search engine" vs "other" (by referrer host). No cookie, visitor ID or IP is stored; browsers sending Do Not Track / Global Privacy Control are not counted; bots (by user-agent) are ignored; only PUBLISHED articles count. These are page loads, **not unique visitors**, and can be inflated by anyone who calls the endpoint.
- **Registrations:** the article's "Ücretsiz üye ol" button links to `/register?src=blog.<slug>`. At signup the account is linked to that article (first touch, only if the article is published). Users who read an article and register later without that link are **not** counted, so numbers are a floor.
- **Practice starts:** attributed users' `practice_started`, `mock_exam_started`, `diagnostic_started` events after attribution. **Tool starts** (dictionary, score calculator) are not tracked by the site, so they are not included.
- **Purchases / revenue:** PAID orders of attributed users created after attribution, grouped by currency. Only TRY enters the score; other currencies are shown separately and never converted.
- **SEO Value Score (0–100):** weighted traffic 10, ranking 10 (only with Search Console data for the page, ≥100 impressions; otherwise weights are rescaled), registration rate 15, registrations 25, practice starts 10, paying customers 15, revenue 15. Each component reaches full marks at a fixed reference target (shown in the UI). Targets are editorial assumptions, not industry measurements. No score under 20 views with no registrations/purchases. "Engagement" (time on page, scroll) is not measured.
- **Privacy:** the attribution row links one account to one article and is deleted with the account. Your privacy notice should mention the aggregate counter and the signup tag (legal review is yours).

## UI
`/admin/seo/conversions` — 7/30/90-day windows, totals, per-article table sorted by value score, link to the studio draft, and a "how is the score computed" panel.

## Not done
Per-day trends/charts, unique-visitor estimates, multi-touch attribution, cross-device matching, bounce/engagement, exporting.

## Validation (local)
29/29 SEO tests (4 new: source/referrer/bot rules, score properties incl. "500 views + 30 registrations beats 10,000 views + 0", counter privacy and validation via the real route handler, first-touch attribution + report with practice/orders/currencies/permissions/account deletion). No migration drift, lint, TypeScript, production build. Local HTTP check: beacon counted, GPC request ignored, register page carries a valid tag and drops an invalid one, conversions page renders. The signup action itself was not exercised end to end in a browser.
