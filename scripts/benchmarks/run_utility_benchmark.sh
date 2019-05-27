#!/bin/bash
export NETWORK_NAME=decentralized-energy-trading
export PARITY_VERSION=v2.4.5
export PROJECT_ROOT=$(git rev-parse --show-toplevel)

echo "Starting test network using docker ..."
cd $PROJECT_ROOT/parity-authority/docker
docker-compose up -d &> /dev/null

echo "Starting benchmark ..."
cd $PROJECT_ROOT
node $PROJECT_ROOT/scripts/benchmarks/utility_benchmark.js
echo "Benchmark done!"

echo "Cleaning up ..."
cd $PROJECT_ROOT/parity-authority/docker
docker-compose -f $PROJECT_ROOT/parity-authority/docker/docker-compose.yml down -v &> /dev/null
echo "Done!"