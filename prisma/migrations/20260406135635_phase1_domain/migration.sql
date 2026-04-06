-- CreateEnum
CREATE TYPE "DevelopmentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PublicLotStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "InternalLotStatus" AS ENUM ('NEW', 'CONTACTED', 'NEGOTIATION', 'DOCUMENTATION', 'CLOSED', 'CANCELED');

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Development" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "fullDescription" TEXT,
    "status" "DevelopmentStatus" NOT NULL DEFAULT 'DRAFT',
    "address" TEXT,
    "whatsapp" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "pricePerSquareMeter" DECIMAL(12,2),
    "bannerUrl" TEXT,
    "logoUrl" TEXT,
    "mapSvgUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Development_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL,
    "developmentId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lot" (
    "id" TEXT NOT NULL,
    "developmentId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "areaM2" DECIMAL(10,2),
    "frontMeters" DECIMAL(10,2),
    "backMeters" DECIMAL(10,2),
    "leftMeters" DECIMAL(10,2),
    "rightMeters" DECIMAL(10,2),
    "publicStatus" "PublicLotStatus" NOT NULL DEFAULT 'AVAILABLE',
    "internalStatus" "InternalLotStatus" NOT NULL DEFAULT 'NEW',
    "estimatedValue" DECIMAL(12,2),
    "manualValue" DECIMAL(12,2),
    "valuationFactor" DECIMAL(10,4),
    "publicNotes" TEXT,
    "internalNotes" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "visiblePublicly" BOOLEAN NOT NULL DEFAULT true,
    "geometryRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LotOwnerInfo" (
    "id" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "buyerName" TEXT,
    "buyerDocument" TEXT,
    "buyerPhone" TEXT,
    "buyerEmail" TEXT,
    "brokerName" TEXT,
    "negotiatedValue" DECIMAL(12,2),
    "reservationDate" TIMESTAMP(3),
    "saleDate" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "contractSigned" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LotOwnerInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LotHistory" (
    "id" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "previousValue" JSONB,
    "newValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LotHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");

-- CreateIndex
CREATE INDEX "Development_companyId_idx" ON "Development"("companyId");

-- CreateIndex
CREATE INDEX "Development_cityId_idx" ON "Development"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "Development_cityId_slug_key" ON "Development"("cityId", "slug");

-- CreateIndex
CREATE INDEX "Block_developmentId_idx" ON "Block"("developmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Block_developmentId_code_key" ON "Block"("developmentId", "code");

-- CreateIndex
CREATE INDEX "Lot_developmentId_idx" ON "Lot"("developmentId");

-- CreateIndex
CREATE INDEX "Lot_blockId_idx" ON "Lot"("blockId");

-- CreateIndex
CREATE INDEX "Lot_publicStatus_idx" ON "Lot"("publicStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Lot_developmentId_code_key" ON "Lot"("developmentId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Lot_blockId_number_key" ON "Lot"("blockId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Lot_developmentId_geometryRef_key" ON "Lot"("developmentId", "geometryRef");

-- CreateIndex
CREATE UNIQUE INDEX "LotOwnerInfo_lotId_key" ON "LotOwnerInfo"("lotId");

-- CreateIndex
CREATE INDEX "LotHistory_lotId_idx" ON "LotHistory"("lotId");

-- CreateIndex
CREATE INDEX "LotHistory_userId_idx" ON "LotHistory"("userId");

-- AddForeignKey
ALTER TABLE "Development" ADD CONSTRAINT "Development_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Development" ADD CONSTRAINT "Development_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lot" ADD CONSTRAINT "Lot_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lot" ADD CONSTRAINT "Lot_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotOwnerInfo" ADD CONSTRAINT "LotOwnerInfo_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotHistory" ADD CONSTRAINT "LotHistory_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotHistory" ADD CONSTRAINT "LotHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
