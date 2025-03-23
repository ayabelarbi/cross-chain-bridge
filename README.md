# Cross-Chain Bridge System

A secure and efficient cross-chain bridge system that enables token transfers between Ethereum Holesky testnet and Base Sepolia. The system consists of smart contracts deployed on both chains and an indexer service that monitors and processes bridge transactions.

## Architecture

### Smart Contracts
- `TokenBridge.sol`: Main bridge contract deployed on both chains
  - Handles token deposits and distributions
  - Implements security measures and ownership controls
  - Supports emergency withdrawals
- `TestToken.sol`: ERC20 token for testing purposes

### Indexer Service
- TypeScript-based event listener and processor
- Uses Prisma ORM with PostgreSQL for transaction tracking
- Implements confirmation waiting for transaction finality
- Handles automatic distribution of tokens on the target chain

## Prerequisites

- Node.js (v16+)
- PostgreSQL
- Yarn
- Access to Holesky and Base Sepolia RPC endpoints
- Private key with funds on both networks

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ayabelarbi/cross-chain-bridge
cd cross-chain-bridge
```

2. Install dependencies:
```bash
# Install Foundry (for smart contracts)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install Node.js dependencies
cd indexer
yarn install
```

3. Set up the database:
```bash
# Start PostgreSQL
brew services start postgresql

# Create the database
createdb bridge_db

# Run migrations
cd indexer
yarn prisma migrate dev
```

4. Configure environment variables:
```bash
cp indexer/.env.example indexer/.env
# Edit .env with your configuration
```

Required environment variables:
```
HOLESKY_RPC_URL=your_holesky_rpc_url
BASE_RPC_URL=your_base_rpc_url
PRIVATE_KEY=your_private_key
DATABASE_URL=postgresql://user:password@localhost:5432/bridge_db
```

## Smart Contract Deployment

1. Configure networks in `foundry.toml`
2. Deploy contracts:
```bash
forge script script/DeployTokenBridge.s.sol --rpc-url holesky --broadcast
forge script script/DeployTokenBridge.s.sol --rpc-url base_sepolia --broadcast
```

## Running the Indexer

1. Start the indexer service:
```bash
cd indexer
yarn ts-node src/index.ts
```

2. The indexer will:
   - Monitor deposit events on both chains
   - Wait for required confirmations
   - Process token distributions
   - Log all activities

## Testing

1. Run smart contract tests:
```bash
forge test
```

2. Test the bridge functionality:
```bash
cd indexer
yarn ts-node src/scripts/test-bridge.ts
```

The test script will:
- Check initial balances
- Approve and deposit tokens
- Monitor for distribution events
- Verify final balances

## Security Features

- Confirmation waiting periods for each chain
- Owner-controlled token whitelisting
- Emergency withdrawal functionality
- Transaction nonce tracking
- Database-backed event processing

## Database Schema

### BridgeDeposit
- Tracks all bridge transactions
- Records status and confirmations
- Stores transaction hashes

### SupportedToken
- Whitelisted tokens
- Token metadata (symbol, decimals)
- Chain-specific addresses

### ChainMetadata
- Chain-specific configurations
- Required confirmation counts
- Last processed block numbers

## Monitoring and Maintenance

- Logs are written to `indexer.log`
- PostgreSQL database for transaction tracking
- Error handling and recovery mechanisms
- Chain reorganization protection

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT
