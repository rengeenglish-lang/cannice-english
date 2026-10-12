-- CreateTable
CREATE TABLE "english_placements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cefr" TEXT NOT NULL,
    "correct" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "english_placements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "english_placements_userId_createdAt_idx" ON "english_placements"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "english_placements" ADD CONSTRAINT "english_placements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

