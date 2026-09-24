/*
  Warnings:

  - Added the required column `updatedAt` to the `coaching_check_ins` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "coaching_check_ins" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
