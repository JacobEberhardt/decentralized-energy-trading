#!/bin/bash
[ -z "$PROJECT_ROOT" ] && PROJECT_ROOT=$(git rev-parse --show-toplevel)
[ -z "$PARITY_NATIVE_PATH" ] && PARITY_NATIVE_PATH="$PROJECT_ROOT/parity-authority/native"
[ -z "$BOOTNODE_KEY_PATH" ] && BOOTNODE_KEY_PATH="$PARITY_NATIVE_PATH/parity/bootnode.key"

if [ ! -f $BOOTNODE_KEY_PATH ]
then
    echo "Generating a new bootnode key ..."
    bootnode -genkey $BOOTNODE_KEY_PATH
fi

if [ "$1" != "--test" ]
then
    bootnode -nodekey $BOOTNODE_KEY_PATH -addr ":30400"  -nat "any"
else
    bootnode -nodekey $BOOTNODE_KEY_PATH -addr ":30400"  -nat "any" & export BOOTNODE_PID=$!
fi