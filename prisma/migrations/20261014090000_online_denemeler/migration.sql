-- CreateEnum
CREATE TYPE "OnlineDenemeMode" AS ENUM ('KLASIK', 'OPTIK');

-- CreateTable
CREATE TABLE "online_deneme_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "denemeNo" INTEGER NOT NULL,
    "mode" "OnlineDenemeMode" NOT NULL DEFAULT 'KLASIK',
    "status" "DiagnosticAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadlineAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "timedOut" BOOLEAN NOT NULL DEFAULT false,
    "correct" INTEGER,
    "wrong" INTEGER,
    "blank" INTEGER,
    "score" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "online_deneme_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "online_deneme_answers" (
    "attemptId" TEXT NOT NULL,
    "n" INTEGER NOT NULL,
    "choice" INTEGER,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "online_deneme_answers_pkey" PRIMARY KEY ("attemptId","n")
);

-- CreateIndex
CREATE INDEX "online_deneme_attempts_userId_denemeNo_status_idx" ON "online_deneme_attempts"("userId", "denemeNo", "status");

-- AddForeignKey
ALTER TABLE "online_deneme_attempts" ADD CONSTRAINT "online_deneme_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "online_deneme_answers" ADD CONSTRAINT "online_deneme_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "online_deneme_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

