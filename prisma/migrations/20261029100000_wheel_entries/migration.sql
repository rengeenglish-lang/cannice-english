-- Spin-the-wheel popup: one entry per email, recording the prize drawn and when consent was given.
CREATE TABLE "wheel_entries" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "prize" TEXT NOT NULL,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wheel_entries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "wheel_entries_email_key" ON "wheel_entries"("email");
