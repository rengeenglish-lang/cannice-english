-- CreateTable
CREATE TABLE "lexicon_word_states" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" TEXT,
    "note" TEXT,
    "seenAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lexicon_word_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lexicon_set_tests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "wrongWordIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lexicon_set_tests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lexicon_word_states_userId_level_idx" ON "lexicon_word_states"("userId", "level");

-- CreateIndex
CREATE UNIQUE INDEX "lexicon_word_states_userId_wordId_key" ON "lexicon_word_states"("userId", "wordId");

-- CreateIndex
CREATE INDEX "lexicon_set_tests_userId_level_setNumber_idx" ON "lexicon_set_tests"("userId", "level", "setNumber");

-- AddForeignKey
ALTER TABLE "lexicon_word_states" ADD CONSTRAINT "lexicon_word_states_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lexicon_set_tests" ADD CONSTRAINT "lexicon_set_tests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
