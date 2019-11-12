# Benchmarks
## Get started
### Parity node for running benchmarks
1. Install parity [v2.5.9](https://github.com/paritytech/parity-ethereum/releases/tag/v2.5.9)
2. Run `yarn run-benchmark-node`
    - This will use the configuration files under `PROJECT_ROOT/benchmark/parity`
    - Related chain data will be stored under `PROJECT_ROOT/benchmark/parity/chain-data`
    - To start node from scratch run with `-c` flag

The parity node is configured as follows:
  - 1 authority PoA setup using Aura with 5 seconds step duration
  - RPC interface `http://localhost:8545` or `ws://localhost:8546`
  - Authority address `0x00Bd138aBD70e2F00903268F3Db08f2D25677C9e`
  - Authority private key `dcb15ba5d2caf586c22f0414f527201d2fb2424c92ced3efacd742a34e5b0db2`
  - Authority keystore json under `PROJECT_ROOT/benchmark/parity/authority.json`
  - Authority password to decrypt keystore json `PROJECT_ROOT/benchmark/parity/authority.pwd` or `node0`
