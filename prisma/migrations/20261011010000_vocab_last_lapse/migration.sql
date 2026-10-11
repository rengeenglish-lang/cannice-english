-- Hata defteri: date a missed vocabulary card by its last "Bilemedim".
-- AlterTable
ALTER TABLE "vocab_cards" ADD COLUMN "lastLapseAt" TIMESTAMP(3);
