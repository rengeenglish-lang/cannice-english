-- Spin-the-wheel anti-abuse: a normalized email (Gmail dots and +tags removed) must be unique,
-- and the hashed IP of each entry is kept to limit repeat spins from one connection.
ALTER TABLE "wheel_entries" ADD COLUMN "normalizedEmail" TEXT;
ALTER TABLE "wheel_entries" ADD COLUMN "ipHash" TEXT;

CREATE UNIQUE INDEX "wheel_entries_normalizedEmail_key" ON "wheel_entries"("normalizedEmail");
CREATE INDEX "wheel_entries_ipHash_createdAt_idx" ON "wheel_entries"("ipHash", "createdAt");
