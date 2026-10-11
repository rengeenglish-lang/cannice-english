-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('PURCHASE', 'PAYMENT', 'LESSON', 'CART', 'COACHING', 'MESSAGE', 'RESULT', 'ACCOUNT', 'ADMIN', 'SYSTEM');

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "category" "NotificationCategory" NOT NULL DEFAULT 'SYSTEM',
ADD COLUMN     "dedupeKey" TEXT;

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_userId_dedupeKey_key" ON "notifications"("userId", "dedupeKey");


-- Existing notifications get a category from where they link to.
UPDATE "notifications" SET "category" = 'PURCHASE' WHERE "href" LIKE '/dashboard/orders%';
UPDATE "notifications" SET "category" = 'COACHING' WHERE "href" LIKE '/dashboard/kocluk%';
UPDATE "notifications" SET "category" = 'LESSON' WHERE "href" LIKE '/dashboard/live-sessions%' OR "href" LIKE '/group-lessons%';
UPDATE "notifications" SET "category" = 'MESSAGE' WHERE "href" LIKE '/dashboard/mesajlar%' OR "href" LIKE '/admin/mesajlar%';
UPDATE "notifications" SET "category" = 'RESULT' WHERE "href" LIKE '/dashboard/sonuc%';
