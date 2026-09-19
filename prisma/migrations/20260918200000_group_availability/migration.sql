-- CreateEnum
CREATE TYPE "GroupBookingStatus" AS ENUM ('ACTIVE', 'CANCELLED');

-- AlterTable
ALTER TABLE "live_sessions" ADD COLUMN     "adminNotes" TEXT,
ADD COLUMN     "availabilityEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cancelled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "displayedOccupancy" INTEGER,
ADD COLUMN     "enrollmentOpen" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "instructorId" TEXT,
ADD COLUMN     "recurringSeriesId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "useDisplayedOccupancy" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "capacity" SET DEFAULT 10;

-- CreateTable
CREATE TABLE "group_lesson_series" (
    "id" TEXT NOT NULL,
    "repeatUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_lesson_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_lesson_enrollments" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "GroupBookingStatus" NOT NULL DEFAULT 'ACTIVE',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "group_lesson_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "group_lesson_enrollments_slotId_status_idx" ON "group_lesson_enrollments"("slotId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "group_lesson_enrollments_slotId_studentId_key" ON "group_lesson_enrollments"("slotId", "studentId");

-- CreateIndex
CREATE INDEX "live_sessions_startsAt_availabilityEnabled_idx" ON "live_sessions"("startsAt", "availabilityEnabled");

-- CreateIndex
CREATE INDEX "live_sessions_recurringSeriesId_idx" ON "live_sessions"("recurringSeriesId");

-- AddForeignKey
ALTER TABLE "live_sessions" ADD CONSTRAINT "live_sessions_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_sessions" ADD CONSTRAINT "live_sessions_recurringSeriesId_fkey" FOREIGN KEY ("recurringSeriesId") REFERENCES "group_lesson_series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_lesson_enrollments" ADD CONSTRAINT "group_lesson_enrollments_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "live_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_lesson_enrollments" ADD CONSTRAINT "group_lesson_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

