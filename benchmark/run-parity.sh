#!/bin/bash

BENCHMARK_PARITY_PATH=$(git rev-parse --show-toplevel)/benchmark/parity
c_flag=0

print_usage() {
  printf "Use -c flag to start the chain from scratch."
}

while getopts "c" flag; do
  case "${flag}" in
    c) c_flag=1 ;;
    *) print_usage
       exit 1 ;;
  esac
done

# clean start blockchain with -c flag
if [ $c_flag==1 ]; then
  echo "HELLLOOOOO"
  rm -rf ${BENCHMARK_PARITY_PATH}/chain-data
fi

# import keystore json of authority node
parity \
  --base-path ${BENCHMARK_PARITY_PATH}/chain-data \
  --chain ${BENCHMARK_PARITY_PATH}/chain.json \
  account import ${BENCHMARK_PARITY_PATH}/authority.json

# run parity on custom chain
parity \
  --base-path ${BENCHMARK_PARITY_PATH}/chain-data \
  --chain ${BENCHMARK_PARITY_PATH}/chain.json \
  --config ${BENCHMARK_PARITY_PATH}/authority.toml \
  --password ${BENCHMARK_PARITY_PATH}/authority.pwd & \
  PARITY_PID=$!

# force kill parity on ctrl-c to silence NetworkIOError
trap kill_parity INT

kill_parity() {
  kill -9 ${PARITY_PID}
}

wait
