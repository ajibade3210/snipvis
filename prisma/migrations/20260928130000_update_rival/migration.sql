-- AlterTable
ALTER TABLE "Competitor" ADD COLUMN "avg_view_count" TEXT,
ADD COLUMN "reproducible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "started_date" TIMESTAMP(3);
