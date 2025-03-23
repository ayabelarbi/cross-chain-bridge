import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import { setTimeout } from 'timers/promises';

dotenv.config();

// ABI for ERC20 interface
const erc20Abi = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)"
];

// Bridge ABI (minimal for testing)
const bridgeAbi = [
  "function deposit(address token, address recipient, uint256 amount) external",
  "event Deposit(address indexed token, address indexed from, address indexed to, uint256 amount, uint256 nonce)",
  "event Distribution(address indexed token, address indexed from, address indexed to, uint256 amount, uint256 nonce)"
];

const config = {
  holesky: {
    rpc: process.env.HOLESKY_RPC_URL,
    bridgeAddress: "0x57c30655BC162a0B1fB1964057d0Efea3D5E763e",
    tokenAddress: "0x4059580E0a27b3DB46Fb7962a626AC6b11b567D1"
  },
  base: {
    rpc: process.env.BASE_RPC_URL,
    bridgeAddress: "0xf72A91A5F434b354fd660f31C88598fdf5f410Ee",
    tokenAddress: "0x4059580E0a27b3DB46Fb7962a626AC6b11b567D1"
  }
};

async function main() {
  // Initialize providers and wallet
  const holeskyProvider = new ethers.JsonRpcProvider(config.holesky.rpc);
  const baseProvider = new ethers.JsonRpcProvider(config.base.rpc);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, holeskyProvider);

  // Initialize contracts
  const holeskyToken = new ethers.Contract(config.holesky.tokenAddress, erc20Abi, wallet);
  const holeskyBridge = new ethers.Contract(config.holesky.bridgeAddress, bridgeAbi, wallet);
  const baseToken = new ethers.Contract(config.base.tokenAddress, erc20Abi, baseProvider);

  // Test parameters
  const testAmount = ethers.parseEther("1.0");
  const recipientAddress = wallet.address; // Sending to ourselves for testing

  console.log("Starting bridge test...");
  console.log("Using wallet address:", wallet.address);

  // Step 1: Check initial balances
  const initialHoleskyBalance = await holeskyToken.balanceOf(wallet.address);
  const initialBaseBalance = await baseToken.balanceOf(wallet.address);
  
  console.log("\nInitial balances:");
  console.log("Holesky:", ethers.formatEther(initialHoleskyBalance), "TST");
  console.log("Base:", ethers.formatEther(initialBaseBalance), "TST");

  // Step 2: Approve bridge contract
  console.log("\nApproving bridge contract...");
  const approveTx = await holeskyToken.approve(config.holesky.bridgeAddress, testAmount);
  await approveTx.wait();
  console.log("Approval confirmed:", approveTx.hash);

  // Step 3: Deposit tokens
  console.log("\nDepositing tokens...");
  const depositTx = await holeskyBridge.deposit(
    config.holesky.tokenAddress,
    recipientAddress,
    testAmount
  );
  await depositTx.wait();
  console.log("Deposit confirmed:", depositTx.hash);

  // Step 4: Wait and monitor for distribution
  console.log("\nWaiting for distribution (this may take a few minutes)...");
  let distributed = false;
  const startTime = Date.now();
  const timeout = 5 * 60 * 1000; // 5 minutes timeout

  while (!distributed && Date.now() - startTime < timeout) {
    const newBaseBalance = await baseToken.balanceOf(wallet.address);
    if (newBaseBalance > initialBaseBalance) {
      distributed = true;
      console.log("\nDistribution detected!");
      console.log("New Base balance:", ethers.formatEther(newBaseBalance), "TST");
      break;
    }
    await setTimeout(5000); // Check every 5 seconds
    process.stdout.write(".");
  }

  if (!distributed) {
    console.log("\nTimeout: Distribution not detected within 5 minutes");
    process.exit(1);
  }

  // Final balance check
  const finalHoleskyBalance = await holeskyToken.balanceOf(wallet.address);
  const finalBaseBalance = await baseToken.balanceOf(wallet.address);

  console.log("\nFinal balances:");
  console.log("Holesky:", ethers.formatEther(finalHoleskyBalance), "TST");
  console.log("Base:", ethers.formatEther(finalBaseBalance), "TST");

  console.log("\nTest completed successfully!");
}

main()
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });
