-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'DONE');

-- CreateEnum
CREATE TYPE "InspirationType" AS ENUM ('THUMBNAIL', 'TITLE', 'HOOK');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('VIDEO', 'AUDIO', 'IMAGE', 'FONT', 'OTHER');

-- CreateEnum
CREATE TYPE "AssetSource" AS ENUM ('PEXELS', 'PIXABAY', 'MIXKIT', 'YOUTUBE', 'OTHER');

-- CreateTable
CREATE TABLE "Inspiration" (
    "id" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "title" TEXT,
    "hook" TEXT,
    "channelName" TEXT,
    "views" TEXT,
    "sourceUrl" TEXT,
    "type" "InspirationType" NOT NULL DEFAULT 'THUMBNAIL',
    "note" TEXT,
    "hook_type" TEXT,
    "hook_formula" TEXT,
    "triggered_emotion" TEXT,
    "strength_score" INTEGER,
    "score_reason" TEXT,
    "improvements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "titleVariants" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recreationIdeas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "riskFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inspiration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "channelId" TEXT,
    "hook" TEXT,
    "scriptLink" TEXT,
    "script" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectInspiration" (
    "projectId" TEXT NOT NULL,
    "inspirationId" TEXT NOT NULL,
    "note" TEXT,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectInspiration_pkey" PRIMARY KEY ("projectId","inspirationId")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "AssetType" NOT NULL DEFAULT 'VIDEO',
    "source" "AssetSource" NOT NULL DEFAULT 'OTHER',
    "licenseText" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectAsset" (
    "projectId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectAsset_pkey" PRIMARY KEY ("projectId","assetId")
);

-- CreateTable
CREATE TABLE "ProjectThumbnail" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectThumbnail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT,
    "avatarUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Channel_name_key" ON "Channel"("name");

-- CreateIndex
CREATE INDEX "Channel_name_idx" ON "Channel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_channelId_idx" ON "Project"("channelId");

-- CreateIndex
CREATE INDEX "ProjectInspiration_projectId_idx" ON "ProjectInspiration"("projectId");

-- CreateIndex
CREATE INDEX "ProjectThumbnail_projectId_idx" ON "ProjectThumbnail"("projectId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInspiration" ADD CONSTRAINT "ProjectInspiration_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInspiration" ADD CONSTRAINT "ProjectInspiration_inspirationId_fkey" FOREIGN KEY ("inspirationId") REFERENCES "Inspiration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAsset" ADD CONSTRAINT "ProjectAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAsset" ADD CONSTRAINT "ProjectAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectThumbnail" ADD CONSTRAINT "ProjectThumbnail_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
