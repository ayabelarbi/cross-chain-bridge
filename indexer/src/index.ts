import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import { createLogger, format, transports } from 'winston';

dotenv.config();

// Configure logger
const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'indexer.log' })
  ]
});

// Bridge ABI (only the events we need)
const bridgeAbi = [
  "event Deposit(address indexed token, address indexed from, address indexed to, uint256 amount, uint256 nonce)",
  "event Distribution(address indexed token, address indexed to, uint256 amount, uint256 nonce)",
  "function distribute(address token, address recipient, uint256 amount, uint256 depositNonce)"
];

// Configuration
const config = {
  holesky: {
    rpc: process.env.HOLESKY_RPC_URL,
    bridgeAddress: "0x17538446a55811e4B35a9F8c4283810CcC6FecFf",
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

    // Initialize contracts
    this.holeskyBridge = new ethers.Contract(config.holesky.bridgeAddress, bridgeAbi, this.holeskyProvider);
    this.baseBridge = new ethers.Contract(config.base.bridgeAddress, bridgeAbi, this.baseProvider);

    // Initialize wallet for signing transactions
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "", this.holeskyProvider);
  }

  async start() {
    logger.info("Starting bridge indexer...");

    // Listen for Deposit events on Holesky
    this.holeskyBridge.on("Deposit", async (token, from, to, amount, nonce, event) => {
      logger.info(`New deposit on Holesky: ${from} -> ${to}, Amount: ${amount}, Nonce: ${nonce}`);
      
      // Wait for confirmations
      await event.getTransaction().then(tx => tx?.wait(config.holesky.confirmations));
      
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
    this.baseBridge.on("Deposit", async (token, from, to, amount, nonce, event) => {
      logger.info(`New deposit on Base: ${from} -> ${to}, Amount: ${amount}, Nonce: ${nonce}`);
      
      // Wait for confirmations
      await event.getTransaction().then(tx => tx?.wait(config.base.confirmations));
      
      // Process the deposit on Holesky
      try {
        const holeskyBridgeWithSigner = this.holeskyBridge.connect(this.wallet);
        await holeskyBridgeWithSigner.distribute(token, to, amount, nonce);
        logger.info(`Processed Base->Holesky bridge: Nonce ${nonce}`);
      } catch (error) {
        logger.error(`Error processing Base->Holesky bridge: ${error}`);
      }
    });

    logger.info("Indexer is running and listening for events...");
  }
}

// Start the indexer
const indexer = new BridgeIndexer();
indexer.start().catch(error => {
  logger.error("Fatal error:", error);
  process.exit(1);
});
