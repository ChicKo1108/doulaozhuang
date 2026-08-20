CREATE SCHEMA IF NOT EXISTS "public";
CREATE TYPE "InventoryOperationType" AS ENUM ('INITIALIZE', 'ADD_COLOR', 'SET_QUANTITY', 'UNDO');

CREATE TABLE "User" (
  "id" TEXT NOT NULL, "wechatOpenId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Vault" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "name" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Vault_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "InventoryItem" (
  "id" TEXT NOT NULL, "vaultId" TEXT NOT NULL, "brand" TEXT NOT NULL, "paletteName" TEXT NOT NULL, "code" TEXT NOT NULL, "hex" TEXT NOT NULL, "quantity" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "InventoryOperation" (
  "id" TEXT NOT NULL, "itemId" TEXT NOT NULL, "type" "InventoryOperationType" NOT NULL, "before" INTEGER NOT NULL, "after" INTEGER NOT NULL, "delta" INTEGER NOT NULL, "undoOfId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryOperation_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Pattern" (
  "id" TEXT NOT NULL, "vaultId" TEXT NOT NULL, "name" TEXT NOT NULL, "gridSize" INTEGER NOT NULL, "colorLimit" INTEGER NOT NULL, "totalBeads" INTEGER NOT NULL, "colorCount" INTEGER NOT NULL, "sourcePath" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Pattern_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PatternUsage" (
  "id" TEXT NOT NULL, "patternId" TEXT NOT NULL, "code" TEXT NOT NULL, "quantity" INTEGER NOT NULL,
  CONSTRAINT "PatternUsage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_wechatOpenId_key" ON "User"("wechatOpenId");
CREATE INDEX "Vault_userId_updatedAt_idx" ON "Vault"("userId", "updatedAt");
CREATE INDEX "InventoryItem_vaultId_code_idx" ON "InventoryItem"("vaultId", "code");
CREATE UNIQUE INDEX "InventoryItem_vaultId_brand_paletteName_code_key" ON "InventoryItem"("vaultId", "brand", "paletteName", "code");
CREATE UNIQUE INDEX "InventoryOperation_undoOfId_key" ON "InventoryOperation"("undoOfId");
CREATE INDEX "InventoryOperation_itemId_createdAt_idx" ON "InventoryOperation"("itemId", "createdAt");
CREATE INDEX "Pattern_vaultId_createdAt_idx" ON "Pattern"("vaultId", "createdAt");
CREATE UNIQUE INDEX "PatternUsage_patternId_code_key" ON "PatternUsage"("patternId", "code");

ALTER TABLE "Vault" ADD CONSTRAINT "Vault_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryOperation" ADD CONSTRAINT "InventoryOperation_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryOperation" ADD CONSTRAINT "InventoryOperation_undoOfId_fkey" FOREIGN KEY ("undoOfId") REFERENCES "InventoryOperation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Pattern" ADD CONSTRAINT "Pattern_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PatternUsage" ADD CONSTRAINT "PatternUsage_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "Pattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;
