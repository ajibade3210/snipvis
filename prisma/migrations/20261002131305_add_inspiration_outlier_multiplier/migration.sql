-- AlterTable
ALTER TABLE "Inspiration" ADD COLUMN     "is_outlier" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "multiplier" TEXT;
