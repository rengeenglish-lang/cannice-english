/*
  Warnings:

  - Added the required column `maxCorrect` to the `score_conversion_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minCorrect` to the `score_conversion_entries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "score_conversion_entries" ADD COLUMN     "maxCorrect" INTEGER NOT NULL,
ADD COLUMN     "minCorrect" INTEGER NOT NULL;
