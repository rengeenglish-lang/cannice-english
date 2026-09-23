-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('BASLANGIC', 'CIRAK', 'UZMAN');

-- CreateEnum
CREATE TYPE "PlanPerk" AS ENUM ('SPEAKING_CLUB', 'SYSTEMATIC_LIVE', 'ELECTIVE_LIVE');

-- CreateEnum
CREATE TYPE "ResourceKind" AS ENUM ('E_BOOK', 'TOPIC', 'PDF_MOCK');

-- AlterEnum
ALTER TYPE "ProductCategory" ADD VALUE 'PLAN';

-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN     "groupSlotId" TEXT;

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "isSpeakingClub" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "enrollments" ADD COLUMN     "paidThrough" TIMESTAMP(3),
ADD COLUMN     "renewalNoticeSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "free_resources" ADD COLUMN     "kind" "ResourceKind";

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "groupSlotId" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "accessMonths" INTEGER,
ADD COLUMN     "planTier" "PlanTier";

-- CreateTable
CREATE TABLE "plan_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "PlanTier" NOT NULL,
    "orderItemId" TEXT,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_perk_claims" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "perk" "PlanPerk" NOT NULL,
    "courseId" TEXT NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_perk_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_exam_topics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examTopicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_exam_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_messages" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT,
    "body" TEXT NOT NULL,
    "reply" TEXT,
    "repliedById" TEXT,
    "repliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_visits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "pageViews" INTEGER NOT NULL DEFAULT 1,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_visits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plan_subscriptions_orderItemId_key" ON "plan_subscriptions"("orderItemId");

-- CreateIndex
CREATE INDEX "plan_subscriptions_userId_status_expiresAt_idx" ON "plan_subscriptions"("userId", "status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "plan_perk_claims_subscriptionId_perk_key" ON "plan_perk_claims"("subscriptionId", "perk");

-- CreateIndex
CREATE UNIQUE INDEX "saved_exam_topics_userId_examTopicId_key" ON "saved_exam_topics"("userId", "examTopicId");

-- CreateIndex
CREATE INDEX "teacher_messages_studentId_createdAt_idx" ON "teacher_messages"("studentId", "createdAt");

-- CreateIndex
CREATE INDEX "teacher_messages_repliedAt_idx" ON "teacher_messages"("repliedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_visits_userId_day_key" ON "user_visits"("userId", "day");

-- AddForeignKey
ALTER TABLE "plan_subscriptions" ADD CONSTRAINT "plan_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_subscriptions" ADD CONSTRAINT "plan_subscriptions_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_perk_claims" ADD CONSTRAINT "plan_perk_claims_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "plan_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_perk_claims" ADD CONSTRAINT "plan_perk_claims_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_exam_topics" ADD CONSTRAINT "saved_exam_topics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_exam_topics" ADD CONSTRAINT "saved_exam_topics_examTopicId_fkey" FOREIGN KEY ("examTopicId") REFERENCES "exam_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_messages" ADD CONSTRAINT "teacher_messages_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_messages" ADD CONSTRAINT "teacher_messages_repliedById_fkey" FOREIGN KEY ("repliedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_messages" ADD CONSTRAINT "teacher_messages_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_visits" ADD CONSTRAINT "user_visits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
