import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import winston from 'winston';
import { bridgeAbi } from './abi/bridge';

dotenv.config();

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'indexer.log' })
  ]
});

// Chain configuration
const config = {
  holesky: {
    rpc: process.env.HOLESKY_RPC_URL,
    bridgeAddress: "0x57c30655BC162a0B1fB1964057d0Efea3D5E763e",
    confirmations: 5
  },
  base: {
    rpc: process.env.BASE_RPC_URL,
    bridgeAddress: "0xf72A91A5F434b354fd660f31C88598fdf5f410Ee",
    confirmations: 12
  }
};

class BridgeIndexer {
  private holeskyProvider: ethers.Provider;
  private baseProvider: ethers.Provider;
  private holeskyBridge: ethers.Contract;
  private baseBridge: ethers.Contract;
  private wallet: ethers.Wallet;

  constructor() {
    // Initialize providers
    this.holeskyProvider = new ethers.JsonRpcProvider(config.holesky.rpc);
    this.baseProvider = new ethers.JsonRpcProvider(config.base.rpc);

    // Initialize contracts with ABI
    this.holeskyBridge = new ethers.Contract(config.holesky.bridgeAddress, bridgeAbi, this.holeskyProvider);
    this.baseBridge = new ethers.Contract(config.base.bridgeAddress, bridgeAbi, this.baseProvider);

    // Initialize wallet for signing transactions
    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY not found in environment variables");
    }
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.holeskyProvider);
  }

  async start() {
    logger.info("Starting bridge indexer...");

    // Listen for Deposit events on Holesky
    this.holeskyBridge.on("Deposit", async (token: string, from: string, to: string, amount: bigint, nonce: bigint, event: any) => {
      logger.info(`New deposit on Holesky: ${from} -> ${to}, Amount: ${amount}, Nonce: ${nonce}`);
      
      // Wait for confirmations
      await event.getTransaction().then((tx: any) => tx?.wait(config.holesky.confirmations));
      
      // Process the deposit on Base
      try {
        const baseBridgeWithSigner = this.baseBridge.connect(this.wallet);
        await baseBridgeWithSigner.distribute(token, to, amount, nonce);
        logger.info(`Processed Holesky->Base bridge: Nonce ${nonce}`);
      } catch (error) {
        logger.error(`Error processing Holesky->Base bridge: ${error}`);
      }
    });

    // Listen for Deposit events on Base
    this.baseBridge.on("Deposit", async (token: string, from: string, to: string, amount: bigint, nonce: bigint, event: any) => {
      logger.info(`New deposit on Base: ${from} -> ${to}, Amount: ${amount}, Nonce: ${nonce}`);
      
      // Wait for confirmations
      await event.getTransaction().then((tx: any) => tx?.wait(config.base.confirmations));
      
      // Process the deposit on Holesky
      try {
        const holeskyBridgeWithSigner = this.holeskyBridge.connect(this.wallet);
        await holeskyBridgeWithSigner.distribute(token, to, amount, nonce);
        logger.info(`Processed Base->Holesky bridge: Nonce ${nonce}`);
      } catch (error) {
        logger.error(`Error processing Base->Holesky bridge: ${error}`);
      }
    });

    logger.info("Bridge indexer started successfully");
  }
}

// Start the indexer
const indexer = new BridgeIndexer();
indexer.start().catch((error) => {
  logger.error("Failed to start indexer:", error);
  process.exit(1);
});
