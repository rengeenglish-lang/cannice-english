-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'QUARTERLY', 'SIX_MONTH', 'ANNUAL');

-- CreateEnum
CREATE TYPE "CommercialKind" AS ENUM ('PREMIUM', 'GROUP');

-- CreateEnum
CREATE TYPE "ToolAccessPolicy" AS ENUM ('FREE', 'PREMIUM', 'GROUP_INCLUDED', 'SEPARATE_PURCHASE');

-- CreateEnum
CREATE TYPE "Capability" AS ENUM ('FREE_CONTENT', 'PREMIUM_SIMULATIONS', 'QUESTION_BANK', 'PERFORMANCE_ANALYTICS', 'STUDY_TOOLS', 'DIGITAL_RESOURCES', 'HOMEWORK', 'TEACHER_FEEDBACK', 'GROUP_LESSONS', 'GROUP_FULL_ACCESS');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

-- CreateTable
CREATE TABLE "commercial_prices" (
    "id" TEXT NOT NULL,
    "kind" "CommercialKind" NOT NULL,
    "interval" "BillingInterval" NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commercial_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_tools" (
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "policy" "ToolAccessPolicy" NOT NULL DEFAULT 'SEPARATE_PURCHASE',
    "enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "learning_tools_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "membership_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "interval" "BillingInterval" NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "membership_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_grants" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "capability" "Capability" NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "access_grants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commercial_audit" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commercial_audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "commercial_prices_kind_interval_key" ON "commercial_prices"("kind", "interval");

-- CreateIndex
CREATE UNIQUE INDEX "membership_subscriptions_orderItemId_key" ON "membership_subscriptions"("orderItemId");

-- CreateIndex
CREATE INDEX "membership_subscriptions_userId_expiresAt_idx" ON "membership_subscriptions"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "access_grants_userId_expiresAt_idx" ON "access_grants"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "access_grants_orderItemId_capability_key" ON "access_grants"("orderItemId", "capability");

-- CreateIndex
CREATE INDEX "commercial_audit_targetId_createdAt_idx" ON "commercial_audit"("targetId", "createdAt");

-- AddForeignKey
ALTER TABLE "membership_subscriptions" ADD CONSTRAINT "membership_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_subscriptions" ADD CONSTRAINT "membership_subscriptions_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_grants" ADD CONSTRAINT "access_grants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_grants" ADD CONSTRAINT "access_grants_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commercial_audit" ADD CONSTRAINT "commercial_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "commercial_prices" ADD CONSTRAINT "positive_price" CHECK ("amountMinor" >= 0 AND currency = 'TRY');
ALTER TABLE "commercial_prices" ADD CONSTRAINT "approved_intervals" CHECK ((kind = 'GROUP' AND interval IN ('MONTHLY', 'QUARTERLY', 'SIX_MONTH')) OR (kind = 'PREMIUM' AND interval IN ('MONTHLY', 'QUARTERLY', 'ANNUAL')));
ALTER TABLE "access_grants" ADD CONSTRAINT "valid_grant_period" CHECK ("expiresAt" > "startsAt");
ALTER TABLE "membership_subscriptions" ADD CONSTRAINT "valid_subscription_period" CHECK ("expiresAt" > "startsAt");
INSERT INTO "commercial_prices" (id, kind, interval, "amountMinor", "updatedAt") VALUES
('premium-monthly','PREMIUM','MONTHLY',49900,NOW()),
('premium-quarterly','PREMIUM','QUARTERLY',119900,NOW()),
('premium-annual','PREMIUM','ANNUAL',299900,NOW()),
('group-monthly','GROUP','MONTHLY',199000,NOW()),
('group-quarterly','GROUP','QUARTERLY',499000,NOW()),
('group-six-month','GROUP','SIX_MONTH',849000,NOW());
