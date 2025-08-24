/*
  Warnings:

  - A unique constraint covering the columns `[userId,period]` on the table `Leaderboard` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "public"."ReviewSchedule" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "nextReview" TIMESTAMP(3) NOT NULL,
    "performance" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SharedProgress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "achievementId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "privacy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReviewSchedule_nextReview_idx" ON "public"."ReviewSchedule"("nextReview");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewSchedule_userId_questionId_key" ON "public"."ReviewSchedule"("userId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_userId_period_key" ON "public"."Leaderboard"("userId", "period");

-- AddForeignKey
ALTER TABLE "public"."ReviewSchedule" ADD CONSTRAINT "ReviewSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReviewSchedule" ADD CONSTRAINT "ReviewSchedule_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SharedProgress" ADD CONSTRAINT "SharedProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SharedProgress" ADD CONSTRAINT "SharedProgress_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "public"."Achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
