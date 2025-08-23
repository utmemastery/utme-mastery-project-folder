/*
  Warnings:

  - You are about to drop the column `dateOfBirth` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `school` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."User_email_idx";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "dateOfBirth",
DROP COLUMN "school",
DROP COLUMN "state";
