# Phase 7 — automation safeguards (assisted, read-only automation)

Migration `20261009000100_seo_automation` (additive: `seo_jobs`, `seo_ai_usage`). No new environment variables. **Full autopilot, AI generation and automatic publication are NOT built and stay off**; this phase builds the machinery that must exist before they can be considered, and automates only read-only data jobs.

## Delivered
- **Durable job queue** (`seo_jobs`, every-3-hours cron `/api/cron/seo-jobs` (:05), Bearer `CRON_SECRET`): idempotent by dedupe key, atomic claiming with `FOR UPDATE SKIP LOCKED` (concurrent runners cannot run the same job), 3 attempts with exponential backoff (5 min, 30 min, 3 h), stale-lock recovery after 10 min, every failure logged to the activity log, admin Retry/Cancel.
- **Job types:** `SEARCH_SYNC` (last complete 28 days + the 28 days before, PAGES and QUERIES; only when Search Console is connected) and `INVENTORY_REFRESH` (weekly). Both are read-only data refreshes attributed to "system". Planned only when **Otomatik veri eşitleme** is switched on (default off).
- **Emergency stop** (`Acil durdur`, visible on every SEO page and on `/admin/seo/automation`): cancels queued jobs, stops the job runner and **scheduled automatic publication** (Phase 4 cron). Drafts, schedules, history and analytics are untouched; manual publishing by an admin still works. Fail-safe: unreadable automation settings count as stopped. Audited as EMERGENCY_STOP / EMERGENCY_RESUME.
- **AI cost ledger** (`seo_ai_usage`): the only permitted way for a future adapter to spend is `reserveAiBudget()` — reservations are serialized with an advisory lock, a monthly cap of 0 means *no spending* (never unlimited), exceeding the cap throws instead of proceeding, failed calls release their reservation, settlements record actual cost/tokens. UI shows month/today/7-day/30-day spend and the 50/75/90/100% warning level. Nothing calls it yet because no provider adapter exists.
- **Publishing cron now runs every 3 hours** (was daily; hourly was rejected to limit database wake-ups) and honours the emergency stop. The studio/calendar texts were updated. Both crons share the same 3-hour window so the database wakes once per cycle. A scheduled article goes live within ~3 hours after its time.
- Rate limits: admin actions reuse the existing per-minute limiter; jobs run at most 5 per invocation.

## Not built (needs your decision)
Mode 2 "assisted" generation and Mode 3 "full autopilot": they require an AI provider adapter, an API key and a monthly cap that you set. Settings still cannot enable FULL_AUTOPILOT. Keyword discovery / refresh-analysis / internal-link jobs are not scheduled. No notification/e-mail on job failure (failures are visible on the Otomasyon page and activity log).

## Validation (local)
35/35 SEO tests (6 new: backoff/windows/week keys; budget math; emergency stop permissions/revision/cancel/fail-safe; idempotency, concurrent runners, retry/backoff/failure, stale locks; recurring planning rules; ledger serialization with 5 parallel reservations against a cap, zero-cap, release/settle). No migration drift, lint, TypeScript, build. Cron route returns 401 without the secret; authenticated run verified locally. Playwright journey updated for the new emergency-stop button; runs in CI.
