/*
  Warnings:

  - Added the required column `type` to the `Achievement` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."AchievementType" AS ENUM ('BADGE', 'MILESTONE', 'SCORE');

-- AlterTable
ALTER TABLE "public"."Achievement" ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "type" "public"."AchievementType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."QuizAttempt" ADD COLUMN     "score" INTEGER;

-- AlterTable
ALTER TABLE "public"."StudyTask" ADD COLUMN     "actualTimeSpent" INTEGER;
