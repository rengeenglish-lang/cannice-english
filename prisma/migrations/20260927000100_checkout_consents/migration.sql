ALTER TABLE "orders" ADD COLUMN "checkoutConsent" JSONB;
-- Existing orders retain NULL: consent must never be backfilled or fabricated.
