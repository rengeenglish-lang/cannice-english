-- CreateEnum
CREATE TYPE "SiteReviewKind" AS ENUM ('TEXT', 'VIDEO');

-- CreateEnum
CREATE TYPE "SiteReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "appliesTo" "ProductCategory";

-- CreateTable
CREATE TABLE "site_reviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "SiteReviewKind" NOT NULL,
    "status" "SiteReviewStatus" NOT NULL DEFAULT 'PENDING',
    "rating" INTEGER NOT NULL,
    "displayName" TEXT NOT NULL,
    "examCode" "ExamCode",
    "body" TEXT NOT NULL,
    "videoKey" TEXT,
    "videoUrl" TEXT,
    "usageConsentText" TEXT,
    "usageConsentAt" TIMESTAMP(3),
    "rewardCouponId" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "rejectReason" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_reviews_rewardCouponId_key" ON "site_reviews"("rewardCouponId");

-- CreateIndex
CREATE INDEX "site_reviews_status_featured_createdAt_idx" ON "site_reviews"("status", "featured", "createdAt");

-- CreateIndex
CREATE INDEX "site_reviews_userId_idx" ON "site_reviews"("userId");

-- AddForeignKey
ALTER TABLE "site_reviews" ADD CONSTRAINT "site_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_reviews" ADD CONSTRAINT "site_reviews_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

