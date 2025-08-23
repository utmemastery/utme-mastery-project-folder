/*
  Warnings:

  - A unique constraint covering the columns `[name,subjectId]` on the table `Section` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,topicId]` on the table `UserProgress` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."PerformanceSnapshot" ADD COLUMN     "trend" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."PracticeSession" ADD COLUMN     "status" "public"."MockExamStatus" NOT NULL DEFAULT 'IN_PROGRESS';

-- AlterTable
ALTER TABLE "public"."UserProgress" ADD COLUMN     "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "avgTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "questionsPracticed" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Section_name_subjectId_key" ON "public"."Section"("name", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_topicId_key" ON "public"."UserProgress"("userId", "topicId");
