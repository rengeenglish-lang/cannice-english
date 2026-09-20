-- Enforce "at most one active goal per user+exam" at the database level.
-- Prisma's schema DSL cannot express a partial unique index, so this is hand-written.
-- App code (server/services/diagnostic-goals.service.ts) still wraps target changes
-- in a transaction (deactivate old + create new); this index is the backstop against
-- double-submits/races, not the primary defense.
CREATE UNIQUE INDEX "exam_goals_active_user_exam_key"
  ON "exam_goals" ("userId", "examTypeId")
  WHERE "isActive" = true;
