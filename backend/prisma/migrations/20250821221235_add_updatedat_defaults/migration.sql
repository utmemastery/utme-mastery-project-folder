/*
  Warnings:

  - The values [RECALL,COMPREHENSION,APPLICATION,ANALYSIS,SYNTHESIS,EVALUATION] on the enum `CognitiveLevel` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."CognitiveLevel_new" AS ENUM ('REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE');
ALTER TABLE "public"."Question" ALTER COLUMN "cognitiveLevel" TYPE "public"."CognitiveLevel_new" USING ("cognitiveLevel"::text::"public"."CognitiveLevel_new");
ALTER TYPE "public"."CognitiveLevel" RENAME TO "CognitiveLevel_old";
ALTER TYPE "public"."CognitiveLevel_new" RENAME TO "CognitiveLevel";
DROP TYPE "public"."CognitiveLevel_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."Passage" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Topic" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
