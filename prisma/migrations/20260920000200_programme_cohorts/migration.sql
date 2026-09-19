-- CreateEnum
CREATE TYPE "CohortStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'CANCELLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CohortEnrollmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CohortWaitlistStatus" AS ENUM ('WAITING', 'ENROLLED', 'CANCELLED');

-- AlterTable
ALTER TABLE "live_sessions" ADD COLUMN     "cohortId" TEXT;

-- CreateTable
CREATE TABLE "programme_cohorts" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "expectedEndsAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Istanbul',
    "minimumCapacity" INTEGER NOT NULL DEFAULT 5,
    "maximumCapacity" INTEGER NOT NULL DEFAULT 10,
    "status" "CohortStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programme_cohorts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohort_schedules" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startMinute" INTEGER NOT NULL,
    "endMinute" INTEGER NOT NULL,

    CONSTRAINT "cohort_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohort_enrollments" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "orderItemId" TEXT,
    "status" "CohortEnrollmentStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "cohort_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohort_waitlists" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "CohortWaitlistStatus" NOT NULL DEFAULT 'WAITING',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cohort_waitlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohort_events" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "cohort_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "programme_cohorts_courseId_status_startsAt_idx" ON "programme_cohorts"("courseId", "status", "startsAt");

-- CreateIndex
CREATE INDEX "programme_cohorts_teacherId_status_idx" ON "programme_cohorts"("teacherId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "cohort_schedules_cohortId_weekday_startMinute_key" ON "cohort_schedules"("cohortId", "weekday", "startMinute");

-- CreateIndex
CREATE UNIQUE INDEX "cohort_enrollments_orderItemId_key" ON "cohort_enrollments"("orderItemId");

-- CreateIndex
CREATE INDEX "cohort_enrollments_cohortId_status_idx" ON "cohort_enrollments"("cohortId", "status");

-- CreateIndex
CREATE INDEX "cohort_enrollments_studentId_status_idx" ON "cohort_enrollments"("studentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "cohort_enrollments_cohortId_studentId_key" ON "cohort_enrollments"("cohortId", "studentId");

-- CreateIndex
CREATE INDEX "cohort_waitlists_cohortId_status_joinedAt_idx" ON "cohort_waitlists"("cohortId", "status", "joinedAt");

-- CreateIndex
CREATE UNIQUE INDEX "cohort_waitlists_cohortId_studentId_key" ON "cohort_waitlists"("cohortId", "studentId");

-- CreateIndex
CREATE INDEX "cohort_events_processedAt_createdAt_idx" ON "cohort_events"("processedAt", "createdAt");

-- AddForeignKey
ALTER TABLE "live_sessions" ADD CONSTRAINT "live_sessions_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "programme_cohorts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_cohorts" ADD CONSTRAINT "programme_cohorts_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_cohorts" ADD CONSTRAINT "programme_cohorts_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_schedules" ADD CONSTRAINT "cohort_schedules_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "programme_cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_enrollments" ADD CONSTRAINT "cohort_enrollments_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "programme_cohorts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_enrollments" ADD CONSTRAINT "cohort_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_enrollments" ADD CONSTRAINT "cohort_enrollments_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_waitlists" ADD CONSTRAINT "cohort_waitlists_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "programme_cohorts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_waitlists" ADD CONSTRAINT "cohort_waitlists_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_events" ADD CONSTRAINT "cohort_events_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "programme_cohorts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


ALTER TABLE programme_cohorts ADD CONSTRAINT cohort_capacity_valid CHECK ("minimumCapacity" >= 1 AND "maximumCapacity" >= "minimumCapacity" AND "maximumCapacity" <= 200);
ALTER TABLE programme_cohorts ADD CONSTRAINT cohort_dates_valid CHECK ("expectedEndsAt" > "startsAt");
ALTER TABLE cohort_schedules ADD CONSTRAINT cohort_schedule_valid CHECK (weekday BETWEEN 1 AND 7 AND "startMinute" >= 0 AND "endMinute" <= 1440 AND "endMinute" > "startMinute");
ALTER TABLE cohort_enrollments ADD CONSTRAINT confirmed_requires_payment CHECK (status <> 'CONFIRMED' OR ("orderItemId" IS NOT NULL AND "confirmedAt" IS NOT NULL));

-- Every confirmed-seat write shares the parent row lock, including direct SQL
-- callers. Pending interest and waitlist entries never consume capacity.
CREATE FUNCTION guard_cohort_seat() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE capacity integer; occupied integer;
BEGIN
  IF TG_OP = 'UPDATE' AND (NEW."cohortId" <> OLD."cohortId" OR NEW."studentId" <> OLD."studentId") THEN
    RAISE EXCEPTION 'Membership identity cannot change';
  END IF;
  SELECT "maximumCapacity" INTO capacity FROM programme_cohorts WHERE id = NEW."cohortId" FOR UPDATE;
  IF NEW.status = 'CONFIRMED' THEN
    SELECT count(*) INTO occupied FROM cohort_enrollments WHERE "cohortId" = NEW."cohortId" AND status = 'CONFIRMED' AND id <> NEW.id;
    IF occupied >= capacity THEN RAISE EXCEPTION 'Cohort capacity exceeded'; END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER cohort_seat_guard BEFORE INSERT OR UPDATE ON cohort_enrollments FOR EACH ROW EXECUTE FUNCTION guard_cohort_seat();
CREATE FUNCTION guard_cohort_capacity() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW."courseId" <> OLD."courseId" THEN RAISE EXCEPTION 'Cohort programme cannot change'; END IF;
  IF NEW."maximumCapacity" < (SELECT count(*) FROM cohort_enrollments WHERE "cohortId" = NEW.id AND status = 'CONFIRMED') THEN
    RAISE EXCEPTION 'Capacity below confirmed enrollment';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER cohort_capacity_guard BEFORE UPDATE ON programme_cohorts FOR EACH ROW EXECUTE FUNCTION guard_cohort_capacity();
CREATE INDEX live_sessions_cohort_id_idx ON live_sessions("cohortId");
