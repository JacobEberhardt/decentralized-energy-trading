# Parity PoA Test Chain

This sets up a Proof-of-Authority test chain using Parity. It is based on https://github.com/orbita-center/parity-poa-playground.git and customized to the needs of this project.

## Setup

0. Install [docker](https://docs.docker.com/engine/installation/) and [docker-compose](https://docs.docker.com/compose/install/)
1. Make sure you are in the `parity-authority` directory
1. Run `docker-compose up` or add `-d` flag for silence mode

## Cleanup

If you want to do a cleanup of the volumes and containers run `docker-compose down -v`.

## Access the [ethstats](https://github.com/cubedro/eth-netstats) dashboard.

A nice dashboard is already configured and connected with all the nodes.
Find it at [http://127.0.0.1:3001](http://127.0.0.1:3001).

## Accounts

### Authorities

The JSON key and password files of the authority nodes are under `./parity/authorities`.

## Access JSON RPC

Talk to JSON RPC at [http://127.0.0.1:8545](http://127.0.0.1:8545) with your favorite client.

## Run tests

Make sure to have dependencies installed via `yarn install`. Now you can run the tests in `<PROJECT_ROOT>/test/parity-authority.test.js` via `yarn test-parity-docker`.

## Update Contracts

### Automatically

Run

```bash
yarn update-contract-bytecodes
```

### Manually

To update the `BlockReward`, `Utility` or `ValidatorSet` contract you have to update the respective byte code of the contract in chain spec file under `./parity/config/chain.json`.

1. First compile updated contracts with

```bash
yarn compile-contracts
```

This will generate / update the contract artifacts in `<PROJECT_ROOT>/build/contracts`.

2. Copy updated contract byte code from `<PROJECT_ROOT>/build/contracts/<UPDATED_CONTRACT>.json`.
3. Paste copied byte code into respective address under the `accounts` property of `./parity/config/chain.json`

```json
{
  ...
  "accounts": {
    ...
    // Address of Utility contract
    "0x0000000000000000000000000000000000000042": {
      "balance": 1,
      // Paste copied byte code here if the Utility contract was updated
      "constructor": <UTILITY_CONTRACT_BYTE_CODE>
    },
    // Address of ValidatorSet contract
    "0x0000000000000000000000000000000000000044": {
      "balance": 1,
      // Paste new byte code here if the ValidatorSet contract was updated
      "constructor": <VALIDATOR_SET_CONTRACT_BYTE_CODE>
    }
  }
}
```

4. Make sure to cleanup the chain via `docker-compose down -v` before starting it with the new chain spec.
