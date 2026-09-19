# Weekly group availability

Implemented on `codex/group-availability` for Cannice English. Production is not migrated or deployed.

## Schema and counting

The existing `LiveSession` is reused with default capacity 10, configurable per occurrence, availability enablement, registration open/closed, cancellation, instructor, notes and optional displayed occupancy. Existing sessions remain outside this feature by default. `GroupLessonSeries` groups weekly occurrences; `GroupLessonEnrollment` has one unique row per student/slot and ACTIVE/CANCELLED status. Active rows determine real occupancy; no redundant stored real count. The additive migration is `prisma/migrations/20260918200000_group_availability/migration.sql`.

## Pages and files

- `/group-lessons`: public weekly calendar, previous/next/current week, Istanbul time.
- `/group-lessons/[id]`: confirmation, real capacity, booking/cancellation and alternatives.
- `/admin/group-availability`: admin calendar and demo creation.
- `/admin/group-availability/new` and `/admin/group-availability/[id]`: creation/editing and actual student list.
- Homepage section in `components/availability/AvailabilityHome.tsx`, directly after the existing live-groups section so the original homepage sequence stays intact.
- UI in `components/availability/`; business rules in `lib/availability.ts`; transactions in `server/services/group-availability.service.ts`; authenticated mutations in `app/actions/group-availability.ts`.
- Sign-in/register preserve a validated selected slot. Purchase continuation uses a seven-day HTTP-only cookie and dashboard link.
- Dashboard and learning-service queries include managed lessons only for booked students and hide cancelled session join links.

## Admin workflow

Choose a published course, title, date/time, duration and capacity. Optional instructor and internal notes. Create a weekly series (default 12 weeks, up to 52); occurrences are generated immediately, so no cron is needed. Edit one occurrence or that occurrence and future ones. Close, reopen, cancel, duplicate or delete unused slots. Booking history prevents deletion; capacity cannot fall below active enrollment. Duplicates start closed with no bookings or simulated occupancy. Only ADMIN can manage this feature, including server actions.

## Enrollment and updates

Booking requires an active user and active, unexpired course entitlement. Each booking/cancellation locks the session row inside a transaction. Duplicate attempts are idempotent; simultaneous final-seat attempts cannot overbook. Display occupancy never reduces actual seats. Status is available below 70%, almost full at 70%, full at capacity; manual closed/cancelled and past starts override availability. Actions revalidate pages; visible public/admin calendars refresh every 15 seconds and on focus. Payment does not reserve a seat; students confirm their selection after obtaining course access.

## Demo

The admin demo button creates seven idempotent demo occurrences showing 0, 2, 4, 7, 8, 9 and 10. It creates no users or bookings. Public cards disclose demo occupancy; admin cards label SIMULATED OCCUPANCY. Disable the per-slot demo toggle to show actual enrollment. No production demo records have been created.

## Verification

- Prisma validation and all migrations on disposable local PostgreSQL passed.
- TypeScript check and production webpack build passed.
- `tests/group-availability.test.ts`: occupancy thresholds, demo separation, dates/return URLs; concurrent final seat; duplicates; cancellation/reopen; entitlement; capacity reduction; recurrence single/future edits; duplicate/delete; demo idempotency; week lookup; booked-only dashboard visibility and cancelled lessons.
- Run against an isolated local database whose name ends `_test`: `DATABASE_URL=postgresql://USER@127.0.0.1:PORT/availability_test node --conditions=react-server --import tsx --test tests/group-availability.test.ts`.
- Browser checked desktop and 390px mobile calendar, weekly navigation, homepage section, login return, booking with demo-full occupancy, student denial of admin access, admin recurring creation/edit/closure. No horizontal overflow in the checked mobile calendar.

## Deployment and limits

Apply the additive migration using `prisma migrate deploy` against the intended database before serving the new application, then deploy the branch. Do not run test fixtures on production. Production migration/deployment has not been performed. The existing original checkout's uncommitted seed changes were preserved.

Recurrence is finite (up to 52 weeks), not indefinitely generated. Existing in-app dashboard confirmation is used; no new email/SMS system was added. Payment-provider completion was not exercised end-to-end; continuation is wired into the existing purchase flow and requires final seat confirmation. No production credentials or data were needed for testing.
