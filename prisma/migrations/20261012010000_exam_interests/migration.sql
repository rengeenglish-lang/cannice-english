-- CreateTable
CREATE TABLE "user_exam_interests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examCode" "ExamCode" NOT NULL,
    "examDate" DATE,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_exam_interests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_exam_interests_userId_examCode_key" ON "user_exam_interests"("userId", "examCode");

-- AddForeignKey
ALTER TABLE "user_exam_interests" ADD CONSTRAINT "user_exam_interests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

