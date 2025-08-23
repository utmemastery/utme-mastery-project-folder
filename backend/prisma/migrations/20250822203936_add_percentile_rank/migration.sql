-- AlterEnum
ALTER TYPE "public"."PracticeSessionType" ADD VALUE 'DIAGNOSTIC';

-- AlterTable
ALTER TABLE "public"."PracticeSession" ADD COLUMN     "timeLimit" INTEGER;
