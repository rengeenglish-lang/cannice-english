-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('ISSUED', 'VOID');

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'ISSUED',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "voidedAt" TIMESTAMP(3),
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "discountTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "shippingTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "paymentMethod" TEXT NOT NULL,
    "seller" JSONB NOT NULL,
    "buyer" JSONB NOT NULL,
    "items" JSONB NOT NULL,
    "etimsNumber" TEXT,
    "driveFileId" TEXT,
    "driveSyncedAt" TIMESTAMP(3),
    "driveDirty" BOOLEAN NOT NULL DEFAULT true,
    "driveError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_sequences" (
    "year" INTEGER NOT NULL,
    "last" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "invoice_sequences_pkey" PRIMARY KEY ("year")
);

-- CreateTable
CREATE TABLE "drive_folders" (
    "key" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drive_folders_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoices_number_key" ON "invoices"("number");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_orderId_key" ON "invoices"("orderId");

-- CreateIndex
CREATE INDEX "invoices_userId_issuedAt_idx" ON "invoices"("userId", "issuedAt");

-- CreateIndex
CREATE INDEX "invoices_driveDirty_idx" ON "invoices"("driveDirty");

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

