# decentralized-energy-trading

Repository of ISE CP Project Summer 2019.

## Requirements
- [NodeJS](https://nodejs.org/en/download/) >= v10.15.3
- [yarn](https://yarnpkg.com/lang/en/docs/install) >= v1.16 

## Get started
1. Install dependencies
```bash
yarn install
```
2. Start an ethereum client (ganache, parity, truffle develop, etc.) depending on what you want to do
- If you want to use a **docker parity authority** setup see [./parity-authority/docker/README.md](./parity-authority/docker/README.md)
- If you want to use a **native parity authority** setup see [./parity-authority/native/README.md](./parity-authority/native/README.md)
- If you want to use **ganache** run `yarn run-ganache`
- If you want to use **truffle develop** run `truffle develop`
3. Adjust config files according to your setup: `./truffle-config.js` and `./household-server-config.js`
4. Migrate contracts to your setup
- `yarn migrate-contracts-authority` when using a **parity authority** setup
  - This will not actually deploy any contracts as they are specified in the chain spec but will add the address of the authority / owner (0x00bd138abd70e2f00903268f3db08f2d25677c9e) as a household
- `yarn migrate-contracts-ganache` when using a **ganache** setup
  - This will deploy a `FifsUtility` contract with the address `0x00bd138abd70e2f00903268f3db08f2d25677c9e` which is then the owner and also add this address as a household. Note that in this setup no `BlockReward` nor a `ValidatorSet` is included.
5. Start the `household server` see [./household-server/README.md](./household-server/README.md)

## Run tests
- `yarn test-contracts` to test contracts
- `yarn test-parity-native` to test native parity authority setup
- `yarn test-parity-docker` to test docker parity authority setup
- `yarn test-helpers` to test helper functions

## Household Processing Unit
To setup a dockerized version of the complete setup see [./household-processing-unit/README.md](./household-processing-unit/README.md).

## Benchmarks
- `yarn utility-benchmark` to benchmark the `settle` method of the `Utility` contract
