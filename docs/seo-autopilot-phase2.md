# Phase 2 — Content engine (in progress)

Baseline: deployed main e5a032b. The approved roadmap has eight core phases; external CMS connectors are an additional parity extension.

## Implemented first slice

Admin keyword CRUD with archive/restore, locale/market uniqueness, manually recorded intent and research evidence, current active exam references, optimistic revision checks, audit entries and per-admin rate limits. Opportunities display an explicitly editorial relevance score with component points and related inventory records. Search demand and ranking feasibility remain unavailable. Similar titles raise a warning, not a claim of comprehensive semantic cannibalization detection (Phase 3).

The additive SeoKeyword migration includes a unique index, exam foreign key, archive/update index and demand-evidence check. No production schema has been changed for Phase 2. No public pages or BlogPost records are modified.

## Validation

Local isolated migration and keyword tests pass: Turkish normalization, missing metrics, permissions, disabled admins, exact duplicates, stale revisions, archive visibility and audit. Lint, type checks and the production build pass. All 29 migrations applied to a fresh isolated Phase 2 database. Browser CI coverage was extended for keyword creation and mobile opportunity display, but has not yet run for this branch.

## Work still required before Phase 2 is complete

- Editable brand/audience profile and article briefs.
- Provider-backed intent/brief/article/metadata generation with schema validation, explicit cost reservations, timeouts, usage accounting and configured spending caps.
- Existing BlogPost integration for draft editing, quality diagnostics and factual review.
- Full phase browser and regression verification, then release.

Provider and monthly budget were requested from the user. No paid calls, AI credentials, generated production articles or automatic publication were introduced. Generation must remain unavailable until configured. New production environment variables in this slice: none.
