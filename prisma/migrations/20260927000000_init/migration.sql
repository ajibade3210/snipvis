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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inspiration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "channel" TEXT,
    "angle" TEXT,
    "hook" TEXT,
    "scriptLink" TEXT,
    "notes" TEXT,
    "script" TEXT,
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

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "ProjectInspiration_projectId_idx" ON "ProjectInspiration"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectInspiration" ADD CONSTRAINT "ProjectInspiration_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInspiration" ADD CONSTRAINT "ProjectInspiration_inspirationId_fkey" FOREIGN KEY ("inspirationId") REFERENCES "Inspiration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAsset" ADD CONSTRAINT "ProjectAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAsset" ADD CONSTRAINT "ProjectAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

