---
noteId: "1e61fc70226911ea85c0fd637b375b0e"
tags: []

---

# Privacy-Preserving Netting in Local Energy Grids

## Requirements

- [Docker](https://docs.docker.com/install/) >= v19.03.2
- [NodeJS 10](https://nodejs.org/en/download/) = v10.x.x >= v10.15.3
- [Yarn](https://yarnpkg.com/lang/en/docs/install) >= v1.16
- [ZoKrates](https://github.com/Zokrates/ZoKrates) >= 0.5.0

## Dependencies
Dependencies are specified in two files:
- package.json
- household-ui/package.json

## Get started

**1.)** Install dependencies

```bash
# load and install dependencies from package.json
$ yarn install
# load and install dependencies from household-ui/pacakge.json
$ yarn --cwd household-ui/ install
```

**2.)** Setup ZoKrates contract

```bash
yarn setup-zokrates
yarn update-contract-bytecodes
```

For the old timers:
```bash
$ ./scripts/setup_zokrates.sh
$ truffle compile,
$ node ./scripts/update-contract-bytecodes
```

**3.)** Start the ethereum parity chain:

```bash
$ cd parity-authority
$ docker-compose up -d --build
```

**ethstats** is available at: http://localhost:3001

**4.)** Configure the contracts using truffle migrations:
This will run all migrations located within the 'migrations' directory

```bash
yarn migrate-contracts-authority
```

For the old timers:
```bash
$ truffle migrate --reset hard --network authority --f 2
```

**5.)** Start the Netting Entity with netting interval i (default=1min):

```bash
yarn run-netting-entity -i 60000
```
For the old timers:
```bash
$ node ./netting-entity/index.js -i 60000
```

**6.)** Create two databases for both household servers:

```bash
# Assumes project root directory
docker-compose -f mongo/docker-compose.yml up -d
```

**7.)** Start two household servers:

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

For the old timers:
```bash
# Household 1
$ node ./household-server/index.js \
  -a 0x00aa39d30f0d20ff03a22ccfc30b7efbfca597c2 \
  -P node1 \
  -n authority_1 \
  -d mongodb://127.0.0.1:27011

# Household 2
$ node ./household-server/index.js \
  -a 0x002e28950558fbede1a9675cb113f0bd20912019 \
  -P node2 \
  -n authority_2 \
  -d mongodb://127.0.0.1:27012
```

**Note:** Depending on your network settings an extra flag `-h 127.0.0.1` could be needed for both households.

**8.)** Start a mocked sensor for each household:

```bash
# Meter of household 1 with positive energy balance
yarn run-sensor -p 3002 -e +
```

```bash
# Meter of household 2 with negative energy balance
yarn run-sensor -p 3003 -e -
```

For the old timers:
```bash
# Meter of household 1 with positive energy balance
$ node ./mock-sensor/index.js \
  -p 3002 \
  -e +

# Meter of household 2 with negative energy balance
$ node ./household-server/index.js \
  -p 3003
  -e -
```

**9.)** Start two household-ui applications:

```bash
# Household 1
yarn --cwd household-ui/ start
```

```bash
# Household 2
REACT_APP_HSS_PORT=3003 \
 PORT=3010 \
 yarn --cwd household-ui/ start
```

For the old timers:
```bash
# Household 1
$ node ./household-ui/node_modules/react-scripts/scripts/start.js

# Household 2
$ node ./household-ui/node_modules/react-scripts/scripts/start.js \
  REACT_APP_HSS_PORT=3003 \
  PORT=3010
```

## Tests

- `yarn test-contracts` to test contracts
- `yarn test-parity-docker` to test docker parity authority setup
- `yarn test-helpers` to test helper functions
- `yarn test-utility-js` to test off-chain utility functionality

## Benchmarks

- `yarn utility-benchmark` to benchmark the `settle` method of the `Utility` contract

## Development

- `yarn update-contract-bytecodes` to update the contracts code in the `chain.json` file
- `yarn setup-zokrates` to generate a new `Verifier` contract
- `yarn format-all` fix linting issues

## Smart contract and ZoKrates program generation:
- `yarn generate-prooving-files [# Prod] [# Cons]` generates required files for given number of producers and consumers

## UMARs dynamic Docker Creation

#### Start Script

```bash
$ yarn docker-parity-setup $PROSUMERS $CONSUMERS
```

For the old timers:

**1.)** ```bash $ ./parity-authority/parity_setup.sh $PROSUMERS $CONSUMERS ```
Creates i (PROSUMER + CONSUMER) Parity Authority Files (ethkey generate) in Folder parity-authority/parity/authorities/ for necessary Parity ETH accounts (ethkey generate) and key-files
TODO: possibly change
**2.)** ```bash $ node project_root/generateDockerChain.js $HOUSEHOLDS ```
Generates (I) Password and PrivateKey Files for beforehand created Accounts and (II) creates Docker Compose YML File for Parity Chain in folder (project_root/parity-authority)
**3.)** ```bash $ ./scripts/setup_script.sh $PROSUMERS $CONSUMERS ```
**3.1)** Copies the folder $PROJECT_ROOT/zokrates-code/ into the directory referenced by the Dockerfile
**3.2)** ```bash $ node setup_script.js $PROSUMERS $CONSUMERS ```
Creates the Docker Compose YML file for all Households, the Netting Server, the MongoDB instances and the Mock Sensors
