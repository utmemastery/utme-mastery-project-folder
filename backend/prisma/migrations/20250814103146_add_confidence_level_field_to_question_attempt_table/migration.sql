/*
  Warnings:

  - You are about to drop the column `confidenceLevel` on the `QuizAttempt` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."QuestionAttempt" ADD COLUMN     "confidenceLevel" INTEGER;

-- AlterTable
ALTER TABLE "public"."QuizAttempt" DROP COLUMN "confidenceLevel";
