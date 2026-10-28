-- Cached English translation of a Konu Anlatımı lesson body (filled on first request, see
-- server/services/lesson-translation.service.ts). Nullable and additive: existing rows stay NULL.
ALTER TABLE "topic_lessons" ADD COLUMN "contentBodyEn" TEXT;
