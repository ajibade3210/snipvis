-- AlterTable
ALTER TABLE "Competitor" ADD COLUMN "total_view_count" TEXT,
ADD COLUMN "video_count" INTEGER,
ADD COLUMN "country" TEXT,
ADD COLUMN "custom_url" TEXT,
ADD COLUMN "hidden_subscriber_count" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "metadata" JSONB;
