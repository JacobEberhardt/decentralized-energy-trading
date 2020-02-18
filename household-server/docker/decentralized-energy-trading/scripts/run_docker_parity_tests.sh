#!/bin/bash

# Exit if any subcommand fails
set -e

export NETWORK_NAME=decentralized-energy-trading
export PARITY_VERSION=v2.4.5
export PROJECT_ROOT=$(git rev-parse --show-toplevel)

echo "Starting test network using docker ..."
cd $PROJECT_ROOT/parity-authority
[ -d "$PROJECT_ROOT/build" ] && rm -rf $PROJECT_ROOT/build

docker-compose up -d &> /dev/null

export NODE_0="http://$(docker-compose port authority0 8545)"
export NODE_1="http://$(docker-compose port authority1 8545)"
export NODE_2="http://$(docker-compose port authority2 8545)"

echo "Running migrations ..."
yarn migrate-contracts-authority
echo "Migrations completed!"

echo "Starting tests ..."
cd $PROJECT_ROOT
$PROJECT_ROOT/node_modules/.bin/mocha $PROJECT_ROOT/test/parity-authority/docker.test.js --timeout 5000
echo "Tests done!"

echo "Cleaning up ..."
cd $PROJECT_ROOT/parity-authority
docker-compose -f $PROJECT_ROOT/parity-authority/docker-compose.yml down -v &> /dev/null
echo "Done!"
