# decentralized-energy-trading

Repository of ISE CP Project Summer 2019.

## Requirements

- [Docker](https://docs.docker.com/install/) >= v19.03.2
- [NodeJS](https://nodejs.org/en/download/) >= v10.15.3
- [Yarn](https://yarnpkg.com/lang/en/docs/install) >= v1.16
- [ZoKrates](https://github.com/Zokrates/ZoKrates) >= v0.4.6

## Get started

**1.)** Install dependencies

```bash
yarn install
yarn --cwd household-ui/ install
```

**2.)** Start the ethereum parity chain:
```bash
cd parity-authority
docker-compose up -d
```
**ethstats** is available at: http://localhost:3001

**3.)** Configure the contracts using truffle migrations:

```bash
yarn migrate-contracts-authority
```

**4.)** Start the NED server:

```bash
yarn run-ned
```

**5.)** Create two databases for both household servers:
```bash
docker-compose -f mongo/docker-compose.yml up -d
```

**6.)** Start two household servers:
```bash
# Household 1
yarn run-server \
  -a 0x00aa39d30f0d20ff03a22ccfc30b7efbfca597c2 \
  -P node1 -n authority_1 \
  -d mongodb://127.0.0.1:27011
```

```bash
# Household 2
yarn run-server -p 3003 \
  -a 0x002e28950558fbede1a9675cb113f0bd20912019 \
  -P node2 -n authority_2 \
  -d mongodb://127.0.0.1:27012
```

**Note:** Depending on your network settings an extra flag `-h 127.0.0.1` could be needed for both households.

**7.)** Start a mocked sensor for each household:
```bash
# Household 1 with positive energy balance
yarn run-sensor -p 3002 -e +
```

```bash
# Household 2 with negative energy balance
yarn run-sensor -p 3003 -e -
```

**8.)** Start two household-ui applications:

```bash
# Household 1
yarn --cwd household-ui/ star
```

```bash
# Household 2 with negative energy balance
REACT_APP_HSS_PORT=3003 \
 PORT=3010 \
 yarn --cwd household-ui/ star
```
## Tests

- `yarn test-contracts` to test contracts
- `yarn test-parity-docker` to test docker parity authority setup
- `yarn test-helpers` to test helper functions
- `yarn test-utility-js` to test off-chain utility functionality


## Benchmarks

- `yarn utility-benchmark` to benchmark the `settle` method of the `Utility` contract
