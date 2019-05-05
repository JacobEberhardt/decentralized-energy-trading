#!/bin/bash

[ -z "$JSONRPC_PORT" ] && JSONRPC_PORT=8540
[ -z "$WS_PORT" ] && WS_PORT=8450
[ -z "$NETWORK_PORT" ] && NETWORK_PORT=30300
[ -z "$NODE_ID" ] && NODE_ID=0
[ -z "$PROJECT_ROOT" ] && PROJECT_ROOT=$(git rev-parse --show-toplevel)
[ -z "$PARITY_NATIVE_PATH" ] && PARITY_NATIVE_PATH="$PROJECT_ROOT/parity-authority/native"
[ -z "$BOOTNODE_KEY_PATH" ] && BOOTNODE_KEY_PATH="$PARITY_NATIVE_PATH/parity/bootnode.key"
[ -z "$PARITY_NODE_CONFIG" ] && PARITY_NODE_CONFIG="$PARITY_NATIVE_PATH/parity/node.toml"

if [ -f $BOOTNODE_KEY_PATH ]
then
  BOOTNODE=$(bootnode -nodekey $BOOTNODE_KEY_PATH -writeaddress)
else
  echo "Bootnode.key missing!"
  exit 1
fi

ACCOUNT=$(parity account list --config $PARITY_NODE_CONFIG -d /tmp/parity-$NODE_ID)

echo "Stating node with ID '$NODE_ID' ..."
[ -z "$ACCOUNT" ] && ACCOUNT=$(parity account new --config $PARITY_NODE_CONFIG -d /tmp/parity-$NODE_ID)
echo "Node Account: $ACCOUNT"

if [ "$1" != "--test" ]
then
    parity --config $PARITY_NODE_CONFIG --engine-signer $ACCOUNT \
                          --author $ACCOUNT \
                          --jsonrpc-port $(( JSONRPC_PORT + NODE_ID )) \
                          --ws-port $(( WS_PORT + NODE_ID )) \
                          --port $(( NETWORK_PORT + NODE_ID )) \
                          -d /tmp/parity-$NODE_ID \
                          --bootnodes enode://$BOOTNODE@127.0.0.1:30400
else
    parity --config $PARITY_NODE_CONFIG --engine-signer $ACCOUNT \
                          --author $ACCOUNT \
                          --jsonrpc-port $(( JSONRPC_PORT + NODE_ID )) \
                          --ws-port $(( WS_PORT + NODE_ID )) \
                          --port $(( NETWORK_PORT + NODE_ID )) \
                          -d /tmp/parity-$NODE_ID \
                          --bootnodes enode://$BOOTNODE@127.0.0.1:30400 & export NODE_$( echo $NODE_ID )_PID=$!
fi