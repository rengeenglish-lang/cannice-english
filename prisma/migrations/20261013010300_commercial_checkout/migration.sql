-- CreateEnum
CREATE TYPE "PurchaseType" AS ENUM ('LEGACY', 'PREMIUM_SUBSCRIPTION', 'GROUP_PROGRAM', 'DIGITAL_PRODUCT');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'PAYMENT_REVIEW';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "checkoutKey" TEXT,
ADD COLUMN     "commercialKind" "CommercialKind";

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "accessExpiresAt" TIMESTAMP(3),
ADD COLUMN     "billingInterval" "BillingInterval",
ADD COLUMN     "cohortId" TEXT,
ADD COLUMN     "paidThrough" TIMESTAMP(3),
ADD COLUMN     "periodStartsAt" TIMESTAMP(3),
ADD COLUMN     "purchaseType" "PurchaseType" NOT NULL DEFAULT 'LEGACY';

-- AlterTable
ALTER TABLE "commercial_prices" ADD COLUMN     "checkoutEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "programme_cohorts" ADD COLUMN     "graceDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "salesEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seatHoldMinutes" INTEGER NOT NULL DEFAULT 1440;

-- CreateTable
CREATE TABLE "seat_reservations" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seat_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seat_reservations_orderId_key" ON "seat_reservations"("orderId");

-- CreateIndex
CREATE INDEX "seat_reservations_cohortId_releasedAt_expiresAt_idx" ON "seat_reservations"("cohortId", "releasedAt", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "orders_checkoutKey_key" ON "orders"("checkoutKey");

-- CreateIndex
CREATE INDEX "order_items_cohortId_idx" ON "order_items"("cohortId");

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "programme_cohorts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_reservations" ADD CONSTRAINT "seat_reservations_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_reservations" ADD CONSTRAINT "seat_reservations_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "programme_cohorts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Reservations and confirmed seats use the same parent-row lock.
ALTER TABLE programme_cohorts ADD CONSTRAINT cohort_payment_policy_valid CHECK ("graceDays" BETWEEN 0 AND 30 AND "seatHoldMinutes" BETWEEN 5 AND 10080);
ALTER TABLE seat_reservations ADD CONSTRAINT reservation_dates_valid CHECK ("expiresAt" > "createdAt");
ALTER TABLE order_items ADD CONSTRAINT purchase_period_valid CHECK (
 ("purchaseType" NOT IN ('PREMIUM_SUBSCRIPTION','GROUP_PROGRAM') OR ("billingInterval" IS NOT NULL AND quantity = 1)) AND
 ("purchaseType" <> 'GROUP_PROGRAM' OR ("cohortId" IS NOT NULL AND "billingInterval" <> 'ANNUAL')) AND
 ("purchaseType" <> 'PREMIUM_SUBSCRIPTION' OR ("cohortId" IS NULL AND "billingInterval" <> 'SIX_MONTH')) AND
 (("periodStartsAt" IS NULL AND "paidThrough" IS NULL AND "accessExpiresAt" IS NULL) OR
  ("periodStartsAt" IS NOT NULL AND "paidThrough" IS NOT NULL AND "accessExpiresAt" IS NOT NULL AND "paidThrough" > "periodStartsAt" AND "accessExpiresAt" >= "paidThrough"))
);
CREATE FUNCTION guard_seat_reservation() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE capacity integer; occupied bigint;
BEGIN
 IF TG_OP = 'UPDATE' AND (NEW."cohortId" <> OLD."cohortId" OR NEW."orderId" <> OLD."orderId") THEN RAISE EXCEPTION 'Reservation identity cannot change'; END IF;
 SELECT "maximumCapacity" INTO capacity FROM programme_cohorts WHERE id = NEW."cohortId" FOR UPDATE;
 IF NEW."releasedAt" IS NULL AND NEW."expiresAt" > clock_timestamp() THEN
   SELECT (SELECT count(*) FROM cohort_enrollments WHERE "cohortId" = NEW."cohortId" AND status = 'CONFIRMED') +
    (SELECT count(*) FROM seat_reservations WHERE "cohortId" = NEW."cohortId" AND id <> NEW.id AND "releasedAt" IS NULL AND "expiresAt" > clock_timestamp()) INTO occupied;
   IF occupied >= capacity THEN RAISE EXCEPTION 'Cohort capacity exceeded'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER reservation_capacity_guard BEFORE INSERT OR UPDATE ON seat_reservations FOR EACH ROW EXECUTE FUNCTION guard_seat_reservation();
CREATE OR REPLACE FUNCTION guard_cohort_seat() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE capacity integer; occupied bigint;
BEGIN
 IF TG_OP = 'UPDATE' AND (NEW."cohortId" <> OLD."cohortId" OR NEW."studentId" <> OLD."studentId") THEN RAISE EXCEPTION 'Membership identity cannot change'; END IF;
 SELECT "maximumCapacity" INTO capacity FROM programme_cohorts WHERE id = NEW."cohortId" FOR UPDATE;
 IF NEW.status = 'CONFIRMED' THEN
   SELECT (SELECT count(*) FROM cohort_enrollments WHERE "cohortId" = NEW."cohortId" AND status = 'CONFIRMED' AND id <> NEW.id) +
    (SELECT count(*) FROM seat_reservations WHERE "cohortId" = NEW."cohortId" AND "releasedAt" IS NULL AND "expiresAt" > clock_timestamp()) INTO occupied;
   IF occupied >= capacity THEN RAISE EXCEPTION 'Cohort capacity exceeded'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE OR REPLACE FUNCTION guard_cohort_capacity() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW."courseId" <> OLD."courseId" THEN RAISE EXCEPTION 'Cohort programme cannot change'; END IF;
 IF NEW."maximumCapacity" < (SELECT count(*) FROM cohort_enrollments WHERE "cohortId" = NEW.id AND status = 'CONFIRMED') +
 (SELECT count(*) FROM seat_reservations WHERE "cohortId" = NEW.id AND "releasedAt" IS NULL AND "expiresAt" > clock_timestamp()) THEN RAISE EXCEPTION 'Capacity below confirmed and reserved seats'; END IF;
 RETURN NEW;
END $$;
