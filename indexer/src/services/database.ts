import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DepositEvent {
  sourceChain: string;
  targetChain: string;
  depositTxHash: string;
  token: string;
  sender: string;
  recipient: string;
  amount: string;
  nonce: bigint;
  blockNumber: bigint;
}

export class DatabaseService {
  async createDeposit(deposit: DepositEvent) {
    return prisma.bridgeDeposit.create({
      data: {
        ...deposit,
        status: 'pending',
      },
    });
  }

  async updateDepositStatus(depositTxHash: string, status: string, distributionTxHash?: string) {
    return prisma.bridgeDeposit.update({
      where: { depositTxHash },
      data: {
        status,
        distributionTxHash,
        updatedAt: new Date(),
      },
    });
  }

  async getUnprocessedDeposits(sourceChain: string) {
    return prisma.bridgeDeposit.findMany({
      where: {
        sourceChain,
        status: 'pending',
      },
      orderBy: {
        nonce: 'asc',
      },
    });
  }

  async updateConfirmations(depositTxHash: string, confirmations: number) {
    return prisma.bridgeDeposit.update({
      where: { depositTxHash },
      data: {
        confirmations,
        updatedAt: new Date(),
      },
    });
  }

  async addSupportedToken(chain: string, tokenAddress: string, symbol: string, decimals: number) {
    return prisma.supportedToken.create({
      data: {
        chain,
        tokenAddress,
        symbol,
        decimals,
      },
    });
  }

  async updateChainMetadata(chain: string, lastBlockScanned: bigint) {
    return prisma.chainMetadata.upsert({
      where: { chain },
      update: {
        lastBlockScanned,
        updatedAt: new Date(),
      },
      create: {
        chain,
        lastBlockScanned,
        requiredConfirmations: chain === 'holesky' ? 5 : 12,
      },
    });
  }

  async getLastBlockScanned(chain: string): Promise<bigint> {
    const metadata = await prisma.chainMetadata.findUnique({
      where: { chain },
    });
    return metadata?.lastBlockScanned ?? BigInt(0);
  }

  async disconnect() {
    await prisma.$disconnect();
  }
}
