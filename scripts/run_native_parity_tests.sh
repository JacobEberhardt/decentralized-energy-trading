#!/bin/bash
PROJECT_ROOT=$(git rev-parse --show-toplevel)
PARITY_NATIVE_PATH="$PROJECT_ROOT/parity-authority/native"

cd $PARITY_NATIVE_PATH

echo "Starting bootnode ..."

source ./setup_bootnode.sh --test &> /dev/null

echo "Starting node #0 ..."
source ./setup_node.sh --test &> /dev/null

echo "Starting node #1 ..."
export NODE_ID=1
source ./setup_node.sh --test &> /dev/null

sleep 5

echo "Starting tests ..."
$PROJECT_ROOT/node_modules/.bin/mocha $PROJECT_ROOT/test/parity-authority/native.test.js
echo "Tests finished!"

echo "Clean up ..."
kill -9 $BOOTNODE_PID
kill -9 $NODE_0_PID
kill -9 $NODE_1_PID
echo "Done!"