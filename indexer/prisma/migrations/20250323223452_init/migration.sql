-- CreateTable
CREATE TABLE "BridgeDeposit" (
    "id" TEXT NOT NULL,
    "sourceChain" TEXT NOT NULL,
    "targetChain" TEXT NOT NULL,
    "depositTxHash" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "nonce" BIGINT NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "status" TEXT NOT NULL,
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "distributionTxHash" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BridgeDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportedToken" (
    "id" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportedToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChainMetadata" (
    "id" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "lastBlockScanned" BIGINT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiredConfirmations" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChainMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BridgeDeposit_depositTxHash_key" ON "BridgeDeposit"("depositTxHash");

-- CreateIndex
CREATE INDEX "BridgeDeposit_status_idx" ON "BridgeDeposit"("status");

-- CreateIndex
CREATE INDEX "BridgeDeposit_sourceChain_status_idx" ON "BridgeDeposit"("sourceChain", "status");

-- CreateIndex
CREATE INDEX "BridgeDeposit_nonce_sourceChain_idx" ON "BridgeDeposit"("nonce", "sourceChain");

-- CreateIndex
CREATE UNIQUE INDEX "SupportedToken_chain_tokenAddress_key" ON "SupportedToken"("chain", "tokenAddress");

-- CreateIndex
CREATE UNIQUE INDEX "ChainMetadata_chain_key" ON "ChainMetadata"("chain");
