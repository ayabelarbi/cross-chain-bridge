## Informations 

### Deployed Contracts ( HOLESKY )
  TokenBridge deployed to: 0x17538446a55811e4B35a9F8c4283810CcC6FecFf
  TestToken deployed to: 0x57c30655BC162a0B1fB1964057d0Efea3D5E763e
  TestToken added to supported tokens

### Deployed Contracts ( BASE )
  TokenBridge deployed to: 0xf72A91A5F434b354fd660f31C88598fdf5f410Ee
  TestToken deployed to: 0x4059580E0a27b3DB46Fb7962a626AC6b11b567D1
  TestToken added to supported tokens

Holesky Bridge Contract: 0x17538446a55811e4B35a9F8c4283810CcC6FecFf
Base Bridge Contract: 0xf72A91A5F434b354fd660f31C88598fdf5f410Ee

## Foundry Manual

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
