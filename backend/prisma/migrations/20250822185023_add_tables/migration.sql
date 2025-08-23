/*
  Warnings:

  - Added the required column `accuracy` to the `TopicMastery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `avgTime` to the `TopicMastery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionsPracticed` to the `TopicMastery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."PracticeSession" ADD COLUMN     "sectionId" INTEGER;

-- AlterTable
ALTER TABLE "public"."TopicMastery" ADD COLUMN     "accuracy" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "avgTime" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "questionsPracticed" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."UserSettings" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "autoMoveNext" BOOLEAN NOT NULL DEFAULT true,
    "showExplanations" BOOLEAN NOT NULL DEFAULT true,
    "timeWarnings" BOOLEAN NOT NULL DEFAULT true,
    "confidenceTracking" BOOLEAN NOT NULL DEFAULT true,
    "practiceReminders" BOOLEAN NOT NULL DEFAULT true,
    "dailyGoal" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SpacedRepetitionSchedule" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "topicId" INTEGER NOT NULL,
    "intervalDays" INTEGER NOT NULL,
    "nextReview" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpacedRepetitionSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "public"."UserSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SpacedRepetitionSchedule_userId_topicId_key" ON "public"."SpacedRepetitionSchedule"("userId", "topicId");

-- AddForeignKey
ALTER TABLE "public"."UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PracticeSession" ADD CONSTRAINT "PracticeSession_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SpacedRepetitionSchedule" ADD CONSTRAINT "SpacedRepetitionSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SpacedRepetitionSchedule" ADD CONSTRAINT "SpacedRepetitionSchedule_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
