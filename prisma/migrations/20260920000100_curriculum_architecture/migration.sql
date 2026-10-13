-- CreateEnum
CREATE TYPE "CurriculumActivityType" AS ENUM ('LIVE_INSTRUCTION', 'GUIDED_PRACTICE', 'EXAM_SIMULATION', 'INDEPENDENT_STUDY', 'REVIEW_ASSESSMENT');

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "curriculumKey" TEXT,
ADD COLUMN     "curriculumPublishedAt" TIMESTAMP(3),
ADD COLUMN     "curriculumTargetMinutes" INTEGER,
ADD COLUMN     "examFormatVerifiedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "recorded_lessons" ADD COLUMN     "unitId" TEXT;

-- CreateTable
CREATE TABLE "module_duration_budgets" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "type" "CurriculumActivityType" NOT NULL,
    "minutes" INTEGER NOT NULL,

    CONSTRAINT "module_duration_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_units" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "curriculum_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_activities" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "type" "CurriculumActivityType" NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "instructions" TEXT NOT NULL,
    "completionCriteria" TEXT NOT NULL,
    "topicLessonId" TEXT,
    "freeResourceId" TEXT,
    "simulationKey" TEXT,

    CONSTRAINT "curriculum_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_assessments" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "rubric" TEXT NOT NULL,
    "minimumScore" INTEGER,

    CONSTRAINT "activity_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_prerequisites" (
    "activityId" TEXT NOT NULL,
    "prerequisiteId" TEXT NOT NULL,

    CONSTRAINT "activity_prerequisites_pkey" PRIMARY KEY ("activityId","prerequisiteId")
);

-- CreateTable
CREATE TABLE "activity_completions" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "verifiedById" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creditedMinutes" INTEGER NOT NULL,
    "evidenceNote" TEXT NOT NULL,
    "submissionId" TEXT,
    "liveSessionId" TEXT,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "activity_completions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "module_duration_budgets_moduleId_type_key" ON "module_duration_budgets"("moduleId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_units_moduleId_position_key" ON "curriculum_units"("moduleId", "position");

-- CreateIndex
CREATE INDEX "curriculum_activities_topicLessonId_idx" ON "curriculum_activities"("topicLessonId");

-- CreateIndex
CREATE INDEX "curriculum_activities_freeResourceId_idx" ON "curriculum_activities"("freeResourceId");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_activities_lessonId_position_key" ON "curriculum_activities"("lessonId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "activity_assessments_activityId_key" ON "activity_assessments"("activityId");

-- CreateIndex
CREATE INDEX "activity_prerequisites_prerequisiteId_idx" ON "activity_prerequisites"("prerequisiteId");

-- CreateIndex
CREATE UNIQUE INDEX "activity_completions_submissionId_key" ON "activity_completions"("submissionId");

-- CreateIndex
CREATE INDEX "activity_completions_activityId_idx" ON "activity_completions"("activityId");

-- CreateIndex
CREATE INDEX "activity_completions_verifiedById_idx" ON "activity_completions"("verifiedById");

-- CreateIndex
CREATE UNIQUE INDEX "activity_completions_enrollmentId_activityId_key" ON "activity_completions"("enrollmentId", "activityId");

-- CreateIndex
CREATE UNIQUE INDEX "activity_completions_enrollmentId_liveSessionId_key" ON "activity_completions"("enrollmentId", "liveSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "courses_curriculumKey_key" ON "courses"("curriculumKey");

-- CreateIndex
CREATE INDEX "recorded_lessons_unitId_idx" ON "recorded_lessons"("unitId");

-- AddForeignKey
ALTER TABLE "recorded_lessons" ADD CONSTRAINT "recorded_lessons_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "curriculum_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_duration_budgets" ADD CONSTRAINT "module_duration_budgets_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "course_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_units" ADD CONSTRAINT "curriculum_units_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "course_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_activities" ADD CONSTRAINT "curriculum_activities_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "recorded_lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_activities" ADD CONSTRAINT "curriculum_activities_topicLessonId_fkey" FOREIGN KEY ("topicLessonId") REFERENCES "topic_lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_activities" ADD CONSTRAINT "curriculum_activities_freeResourceId_fkey" FOREIGN KEY ("freeResourceId") REFERENCES "free_resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_assessments" ADD CONSTRAINT "activity_assessments_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "curriculum_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_prerequisites" ADD CONSTRAINT "activity_prerequisites_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "curriculum_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_prerequisites" ADD CONSTRAINT "activity_prerequisites_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "curriculum_activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_completions" ADD CONSTRAINT "activity_completions_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_completions" ADD CONSTRAINT "activity_completions_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "curriculum_activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_completions" ADD CONSTRAINT "activity_completions_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_completions" ADD CONSTRAINT "activity_completions_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "practice_submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_completions" ADD CONSTRAINT "activity_completions_liveSessionId_fkey" FOREIGN KEY ("liveSessionId") REFERENCES "live_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Calendar time and module budgets cannot become earned student credit.
ALTER TABLE "courses" ADD CONSTRAINT "curriculum_target" CHECK (
  ("curriculumKey" IS NULL AND "curriculumTargetMinutes" IS NULL AND "curriculumPublishedAt" IS NULL)
  OR ("curriculumKey" IS NOT NULL AND "curriculumTargetMinutes" IS NOT NULL AND "curriculumTargetMinutes" = 15000)
);
ALTER TABLE "module_duration_budgets" ADD CONSTRAINT "budget_nonnegative" CHECK ("minutes" >= 0);
ALTER TABLE "curriculum_activities" ADD CONSTRAINT "activity_duration_positive" CHECK ("durationMinutes" BETWEEN 1 AND 480);
ALTER TABLE "activity_assessments" ADD CONSTRAINT "assessment_score_range" CHECK ("minimumScore" BETWEEN 0 AND 100);
ALTER TABLE "activity_prerequisites" ADD CONSTRAINT "no_self_prerequisite" CHECK ("activityId" <> "prerequisiteId");
ALTER TABLE "activity_completions" ADD CONSTRAINT "credit_positive" CHECK ("creditedMinutes" > 0);
ALTER TABLE "activity_completions" ADD CONSTRAINT "completion_has_one_evidence" CHECK (
  ("submissionId" IS NOT NULL)::int + ("liveSessionId" IS NOT NULL)::int = 1
);

-- Published curricula are immutable. The shared course row lock serializes
-- authoring against publication even if a future caller forgets the service lock.
CREATE FUNCTION guard_curriculum_content() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE row_data jsonb; parent_course text; published timestamp;
BEGIN
  row_data := CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;
  IF TG_OP = 'UPDATE' AND (
    to_jsonb(OLD)->>'courseId' IS DISTINCT FROM to_jsonb(NEW)->>'courseId' OR
    to_jsonb(OLD)->>'moduleId' IS DISTINCT FROM to_jsonb(NEW)->>'moduleId' OR
    to_jsonb(OLD)->>'lessonId' IS DISTINCT FROM to_jsonb(NEW)->>'lessonId' OR
    to_jsonb(OLD)->>'activityId' IS DISTINCT FROM to_jsonb(NEW)->>'activityId'
  ) THEN RAISE EXCEPTION 'Curriculum content cannot be reparented'; END IF;
  IF TG_TABLE_NAME = 'course_modules' THEN
    parent_course := row_data->>'courseId';
  ELSIF TG_TABLE_NAME IN ('curriculum_units', 'recorded_lessons', 'module_duration_budgets') THEN
    SELECT "courseId" INTO parent_course FROM course_modules WHERE id = row_data->>'moduleId';
  ELSIF TG_TABLE_NAME = 'curriculum_activities' THEN
    SELECT m."courseId" INTO parent_course FROM recorded_lessons l JOIN course_modules m ON m.id = l."moduleId" WHERE l.id = row_data->>'lessonId';
  ELSE
    SELECT m."courseId" INTO parent_course FROM curriculum_activities a JOIN recorded_lessons l ON l.id = a."lessonId" JOIN course_modules m ON m.id = l."moduleId" WHERE a.id = row_data->>'activityId';
  END IF;
  SELECT "curriculumPublishedAt" INTO published FROM courses WHERE id = parent_course FOR UPDATE;
  IF published IS NOT NULL THEN RAISE EXCEPTION 'Published curriculum is immutable'; END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END $$;
CREATE TRIGGER curriculum_module_guard BEFORE INSERT OR UPDATE OR DELETE ON course_modules FOR EACH ROW EXECUTE FUNCTION guard_curriculum_content();
CREATE TRIGGER curriculum_unit_guard BEFORE INSERT OR UPDATE OR DELETE ON curriculum_units FOR EACH ROW EXECUTE FUNCTION guard_curriculum_content();
CREATE TRIGGER curriculum_lesson_guard BEFORE INSERT OR UPDATE OR DELETE ON recorded_lessons FOR EACH ROW EXECUTE FUNCTION guard_curriculum_content();
CREATE TRIGGER curriculum_budget_guard BEFORE INSERT OR UPDATE OR DELETE ON module_duration_budgets FOR EACH ROW EXECUTE FUNCTION guard_curriculum_content();
CREATE TRIGGER curriculum_activity_guard BEFORE INSERT OR UPDATE OR DELETE ON curriculum_activities FOR EACH ROW EXECUTE FUNCTION guard_curriculum_content();
CREATE TRIGGER curriculum_assessment_guard BEFORE INSERT OR UPDATE OR DELETE ON activity_assessments FOR EACH ROW EXECUTE FUNCTION guard_curriculum_content();
CREATE TRIGGER curriculum_prerequisite_guard BEFORE INSERT OR UPDATE OR DELETE ON activity_prerequisites FOR EACH ROW EXECUTE FUNCTION guard_curriculum_content();

CREATE FUNCTION guard_curriculum_publication() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD."curriculumPublishedAt" IS NOT NULL AND (
    NEW."curriculumPublishedAt" IS DISTINCT FROM OLD."curriculumPublishedAt" OR
    NEW."curriculumKey" IS DISTINCT FROM OLD."curriculumKey" OR
    NEW."curriculumTargetMinutes" IS DISTINCT FROM OLD."curriculumTargetMinutes"
  ) THEN RAISE EXCEPTION 'Published curriculum identity is immutable'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER curriculum_publication_guard BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION guard_curriculum_publication();

ALTER TABLE "course_modules" ADD COLUMN "description" TEXT;
