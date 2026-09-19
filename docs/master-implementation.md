# Multi-exam implementation audit and delivery plan

Baseline: existing local main inspected on 2026-09-19; work isolated on feat/multi-exam-platform.

## Existing and reusable
Next.js 16 App Router, Prisma/PostgreSQL, credential authentication, STUDENT/TEACHER/ADMIN roles. Seven ExamType codes including PTE and three YÖKDİL fields. Public ExamTopic/TopicLesson content and progress. Product/Course/CourseModule/RecordedLesson, Book, Cart, Order/OrderItem/Payment and Enrollment. Manual payment approval grants course enrollment. LiveSession/GroupLessonSeries and individually booked seats use PostgreSQL row locks. Student dashboard, admin course/content/product management, PracticeSubmission and teacher feedback exist. IELTS/TOEFL speaking practice uses client-side storage, not persisted authoritative simulation results. Existing tokens/buttons/cards and exam pages should be extended.

## Gaps and risks
- No Premium subscription, central commercial plan configuration or unified entitlement resolver.
- A course is an academic offering; a recurring live-session series is not a cohort. Do not equate billing duration to programme length.
- Teachers can approve payments and access broadly scoped administration/submissions. Financial administration must be administrator-only; teaching must be assignment scoped.
- Paid-order approval is not idempotent; no active-period/grace policy for recurring access.
- Displayed occupancy supports fabricated values. Public counts must always derive from real rows; remove demo creation paths.
- No programme units/activities, checked 15,000-minute curriculum, verified activity completion, attendance, homework assignments, cohort waitlist, durable simulations/results, notifications, analytics or site tour.
- Existing notification page is a placeholder, not an integration.
- No actual full-exam banks or approved 250-hour academic plans. Never publish unavailable capabilities or fictional activity completion.
- Existing tests require an isolated localhost *_test database; never use production for tests or schema development.

## Database strategy
Additive migrations preserve all current records. Reuse Course as programme and CourseModule/RecordedLesson; introduce units/activities beneath them. Cohorts reference Course and existing LiveSessions. Subscription and entitlement periods reference payment/order items. Reuse Payment/Order; persist billing snapshots. Extend paid approval transaction to grant exactly once and enforce cohort capacity with shared row locks. Dedicated waitlist, audit and notification records. Persist simulation answers/results server-side and retain result ownership after expiry. No production db push.

## Delivery phases and acceptance gates
1. Central pricing, entitlement policy, payment/admin safeguards; policy tests and migration validation.
2. Curriculum structure, exact duration validation and legitimate completion; exam-specific drafts pending academic review.
3. Cohort seats/waitlist, consistent lock protocol; actual simultaneous final-seat tests.
4. Authoritative checkout/approval/renewal and entitlement activation; retries, failure, expiry, separate purchases.
5. Student programme dashboard, progress and next activity.
6. Assigned teacher dashboard, attendance/homework/feedback.
7. Admin curriculum/cohort/pricing management and audit.
8. Honest public three-path experience and exam-specific discovery; no unavailable feature claims.
9. Dismissible/restartable anchored tour.
10. Outbox notifications, minimal analytics, responsive/accessibility and regression checks.

Each phase is a logical commit after verification. Do not deploy ahead of schema rollout, content readiness or failing gates. Existing purchase records need a documented migration policy, not blanket paid group access.

## Phase 1 implementation status
Foundation draft implemented: six authoritative launch-price rows/migration, commercial audit, tool access policies, paid-source/time-bounded grant resolver, subscription-period schema, integer money and calendar-safe billing periods. Group-wide access deliberately does not bypass actual class enrollment or separate-product purchase checks. Public occupancy ignores all historical simulated overrides; admin demo controls removed. Admin-only manual payment approval locks order rows, validates payment state/amount and records one audit event; paid retries do not duplicate enrollment. Expired course enrollments are omitted from the active dashboard.

These primitives are not yet wired into subscription checkout or the existing simulation UI. Premium is not yet sold by this branch. SUPER_ADMIN is added at the schema/foundation boundary; other legacy admin screens need the role audit in phase 6/7. Existing courses are not automatically reclassified as paid cohorts.

### Passed checks
- Prisma schema validation and client generation.
- TypeScript typecheck.
- Focused ESLint checks.
- Nine unit/regression tests: free access, default denial, Premium scope, group scope, separate purchase exclusion, expiry/revocation, approved billing/month-end dates, real occupancy, existing learning progress.
- Migration generated as an additive schema diff, with price/interval/period CHECK constraints and launch-price inserts.

### Database gate passed
The isolated PostgreSQL 17 CI run passed all migrations, policy tests, payment/access and concurrent session booking integration tests, TypeScript and the production build on commit 37e8561fa4b083ac18fc1116983129eafe73d84d. Evidence: https://github.com/rengeenglish-lang/cannice-english/actions/runs/35465746429. No production database was accessed or modified. Production deployment remains deferred at the user’s request.

### Reproduction in a permitted local development environment
Create a dedicated UTF-8 PostgreSQL database named cannice_platform_test. Set DATABASE_URL and DATABASE_URL_UNPOOLED to that localhost database only.

```
npm ci
npx prisma migrate deploy
npx prisma generate
npm run typecheck
node --import tsx --test tests/commercial.test.ts tests/learning-overview.test.mjs
node --conditions=react-server --import tsx --test tests/commercial-database.test.ts tests/group-availability.test.ts
```

The database tests enforce localhost and the _test suffix. They cover the original concurrent final-session-seat test plus admin-only payment approval, concurrent approval retries, unpaid/refunded access denial. Programme cohort concurrency still belongs to phase 3, not this phase. Run the Next production build with development-only credentials, then verify free lessons, authentication, dashboard and checkout before rollout. The phase 1 migration must precede application activation.

### Outstanding academic decision
The user approved all seven drafted curriculum module plans and hour allocations as written. Detailed activities, resources and assessment mapping remain required before publication.

## Database gate recovery
A pull-request GitHub Actions job now provisions an ephemeral PostgreSQL 17 service with localhost-only test credentials and no production secrets. It runs migrations, policy/progress tests, real payment/booking concurrency tests, and a production build. It has no deployment step. A passing run is required before proceeding.


## Phase 2 — curriculum architecture
Course remains the programme and CourseModule/RecordedLesson remain the module/lesson. Add units, typed activity minutes, rubric assessments, ordered prerequisites, module budgets and evidence-backed completion. All seven approved plans are checked into data/curricula/approved-plans.json with their original scope and allocations. An explicit administrator-only, idempotent import creates unpublished programme courses; migrations never import content or activate sales.

/admin/curricula displays planned vs defined hours, module scope and exact publication blockers. Server services support unit/lesson/activity authoring and exam-format verification. Full interactive authoring, teacher assignment and student dashboard integration remain phases 5–7.

Publication requires 15,000 defined minutes, matching category budgets per module, complete units/lessons/instructions/rubrics, earlier same-program prerequisites and format verification. A made-up simulation key cannot pass the gate: there is no authoritative simulation adapter yet. Published academic content is immutable in the database. Legacy product/course editors cannot modify or sell these programmes.

Completion is administrator verified and audited. Guided/independent/review activities require reviewed submissions belonging to the enrollment, rubric thresholds where configured, and explicit verification. Live activities require an ended, valid course session and an administrator attendance attestation; elapsed time alone earns nothing. Simulation completion is denied until persisted server results exist. Concurrent approvals create one credit; the same submission or live session cannot count twice. Revocation removes credit but preserves history. Expired enrollment cannot gain new credit but its owner can read progress history. Assigned-teacher verification will extend this boundary in phase 6.

### Honest content readiness
Approved plans total 250 hours each. They are not yet 250-hour activity inventories. Import intentionally creates zero activities rather than arbitrarily splitting budgets to manufacture hours. Actual resources, tasks, rubrics, authorized simulation mappings and academic verification remain publication requirements. Phase 2 implements the architecture and approved module import; it does not claim seven publishable programmes or a working full-exam engine.
