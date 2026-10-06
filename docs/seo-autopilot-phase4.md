# Phase 4 — publishing (manual, human-approved)

Baseline: Phase 3 completion (PR #26, `codex/seo-phase3-complete`). No new environment variables, no paid API, no automatic content creation.

## Delivered

- **Approval workflow** (studio section "5. Yayın"): REVIEWED → APPROVED → SCHEDULED/PUBLISHED. Approval is a separate, explicitly confirmed step after the editor review; it stores approver, time and a content fingerprint. Any later change to the brief, text, metadata or approved links voids the approval and cancels a pending schedule.
- **Publishing gate** (`lib/seo/publishing.ts`, no override): review and approval current, all critical editorial checks, checklist score ≥ the configured minimum, unique non-temporary slug (also not claimed by another article's redirect), valid SEO title/description, approved links and CTA still live, no placeholders/empty sections. It is re-run at approval, scheduling, publish-now and on every scheduled publication. A failure never publishes; scheduled items are parked with a visible reason.
- **Scheduling**: 5 minutes–90 days ahead, at most 30 pending, plus the existing daily/weekly article limits from Ayarlar (Istanbul day / Monday-week). `/api/cron/seo-publish` (Bearer `CRON_SECRET`, same guard as the other crons) publishes due, approved items. `vercel.json` runs it **once daily at 05:00 UTC** because the existing crons are daily; change to hourly on a plan that allows it. It only publishes what an active admin approved *and* scheduled, and it refuses if that approver is no longer an active admin.
- **Version history + restore**: immutable snapshots (edit, publish, unpublish, restore) with editor and checklist score. Restore applies to unpublished drafts only and requires re-review/approval. Published articles are read-only in the studio; to edit one, "Yayından kaldır ve düzenle" first (recorded). Performance context is not shown — Search Console is Phase 5.
- **URL stability**: changing the slug of an article that was ever published records a permanent redirect (308) from the old slug; redirects serve only while the article is published, and another article cannot take a redirected slug.
- **Structured data and metadata**: `/blog/[slug]` now emits `BlogPosting` + `BreadcrumbList` JSON-LD (escaped so article text cannot close the script), canonical URL, OpenGraph article times and Twitter card. No FAQ/Course/Review markup — the page has none. Applies to all blog posts, not only SEO-studio ones.
- **Sitemap**: blog `lastmod` is now the last modification time. Drafts, unpublished and scheduled articles are not listed. The sitemap is statically generated, so publish/unpublish/cron revalidate `/sitemap.xml`.
- **Calendar**: `/admin/seo/calendar` list view (scheduled / approved / published). Month/week views and drag-and-drop are not built.
- **Previews**: desktop and narrow-mobile search result and social card in the studio. These are not Google's real rendering.
- Additive migration `20261007000100_seo_publishing`: approval/schedule columns on `seo_article_drafts`, `seo_article_versions`, `seo_slug_redirects`.

## Validation (local, 2026-10-06)

17/17 SEO tests (4 new: gate/window/JSON-LD, approval→publish→edit-voids→unpublish→restore→redirect, scheduling limits/cancel/cron/parking/inactive approver, slug-claim failure), no Prisma schema/migration drift, lint, TypeScript and production build pass. Rendered studio, public article (canonical + JSON-LD) and sitemap checked against a local server. The Playwright publish journey was added to `scripts/verify-seo-browser.ts` but has **not** been run locally; it runs in CI.

## Limitations

- Daily cron means a scheduled article goes live at the first 05:00 UTC run after its time, not at the exact minute.
- Checklist score is editorial hygiene, not accuracy, originality or ranking. No relevance score or semantic cannibalization measurement exists yet, so those gate items from the brief are not enforced.
- Slug/redirect, versions and approvals cover SEO-studio articles; the legacy blog editor is unchanged.
- External CMS/webhook publishing, images/alt-text workflow and FAQ generation are not implemented.

Next: Phase 5 (Search Console snapshots, quick wins, decay) needs Google credentials from the owner.
