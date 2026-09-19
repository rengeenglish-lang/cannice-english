# Platform restructure audit

## What exists

- Reusable `ExamType` taxonomy, free exam topics and lessons, lesson progress and notes.
- Product catalogue, books, courses, carts, orders, payments and enrollments.
- Weekly live-session availability, capacity, enrollment, instructor and administrative overrides.
- IELTS and TOEFL speaking practice with individual and full-test modes.
- Student learning dashboard and role-protected administration.
- Shared typography, colors, buttons, cards, responsive shells and exam landing components.

## What is reused

- Existing database records and relationships remain unchanged.
- Existing authentication, checkout, payment, enrollment and progress flows remain unchanged.
- Existing public URLs remain valid.
- Existing product, group availability and exam services power the restructured homepage.
- Existing speaking simulations remain the linked practice experience.

## What needs modification

- Continue adding contextual learn-to-practice links at individual topic level.
- Expand non-speaking practice and mock-test data models for YDS and YÖKDİL when real question content is available.
- Refine the student dashboard around a selected exam and next useful action.
- Reorganize admin labels into Exams, Free Content, Exam Content, Group Lessons, Materials and Users as those modules grow.
- Add breadcrumbs to deeper lesson, practice and product routes.

## What is missing

- A platform-wide indexed search service. No search control should be shown before it exists.
- Generalized test/result records for non-speaking simulations.
- A supplied mascot asset in the repository. The current brand mark and established visual system are used until the approved character artwork is available.
- Material preview metadata for products that do not already provide a previewable file.

## What should not be touched

- Production student data, orders, payments, purchases, bookings and progress.
- Authentication and role protection.
- Existing working URLs without redirects.
- Existing speaking task timing and exam-specific behavior.
- Capacity derivation and authorized administrative overrides.
