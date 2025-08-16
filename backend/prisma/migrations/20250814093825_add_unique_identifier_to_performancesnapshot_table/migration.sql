/*
  Warnings:

  - A unique constraint covering the columns `[userId,subjectId]` on the table `PerformanceSnapshot` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."userId_subjectId";

-- CreateIndex
CREATE UNIQUE INDEX "PerformanceSnapshot_userId_subjectId_key" ON "public"."PerformanceSnapshot"("userId", "subjectId");
