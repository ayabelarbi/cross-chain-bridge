import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // Initialize chain metadata
  await prisma.chainMetadata.createMany({
    data: [
      {
        chain: 'holesky',
        lastBlockScanned: BigInt(0),
        requiredConfirmations: 5,
        isActive: true
      },
      {
        chain: 'base',
        lastBlockScanned: BigInt(0),
        requiredConfirmations: 12,
        isActive: true
      }
    ],
    skipDuplicates: true
  });

  // Initialize supported tokens
  await prisma.supportedToken.createMany({
    data: [
      {
        chain: 'holesky',
        tokenAddress: '0x57c30655BC162a0B1fB1964057d0Efea3D5E763e', // Your Holesky TestToken
        symbol: 'TST',
        decimals: 18
      },
      {
        chain: 'base',
        tokenAddress: '0x4059580E0a27b3DB46Fb7962a626AC6b11b567D1', // Your Base TestToken
        symbol: 'TST',
        decimals: 18
      }
    ],
    skipDuplicates: true
  });

  console.log('Database initialized successfully!');
}

main()
  .catch((e) => {
    console.error('Error initializing database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
