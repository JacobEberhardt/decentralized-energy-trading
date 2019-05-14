# decentralized-energy-trading

Repository of ISE CP Project Summer 2019.

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
- `yarn migrate-contracts-ganache` when using a **ganache** setup
- `truffle migrate` when using a **truffle develop** setup
5. Start the `household server` see [./household-server/README.md](./household-server/README.md)

## Run tests
- `yarn test-contracts` to test contracts
- `yarn test-parity-native` to test native parity authority setup 
- `yarn test-parity-docker` to test docker parity authority setup
- `yarn test-helpers` to test helper functions
