#!/bin/bash

[ -z "$JSONRPC_PORT" ] && JSONRPC_PORT=8540
[ -z "$WS_PORT" ] && WS_PORT=8450
[ -z "$NETWORK_PORT" ] && NETWORK_PORT=30300
[ -z "$NODE_ID" ] && NODE_ID=0

if [ -f "parity/bootnode.key" ]
then
  BOOTNODE=$(bootnode -nodekey parity/bootnode.key -writeaddress)
else
  echo "Bootnode.key missing!"
  exit 1
fi

ACCOUNT=$(parity account list --config parity/node.toml -d /tmp/parity-$NODE_ID)

echo "Stating node with ID '$NODE_ID' ..."
[ -z "$ACCOUNT" ] && ACCOUNT=$(parity account new --config parity/node.toml -d /tmp/parity-$NODE_ID)
echo "Node Account: $ACCOUNT"

if [ "$1" != "--test" ]
then
    parity --config parity/node.toml --engine-signer $ACCOUNT \
                          --author $ACCOUNT \
                          --jsonrpc-port $(( JSONRPC_PORT + NODE_ID )) \
                          --ws-port $(( WS_PORT + NODE_ID )) \
                          --port $(( NETWORK_PORT + NODE_ID )) \
                          -d /tmp/parity-$NODE_ID \
                          --bootnodes enode://$BOOTNODE@127.0.0.1:30400
else
    parity --config parity/node.toml --engine-signer $ACCOUNT \
                          --author $ACCOUNT \
                          --jsonrpc-port $(( JSONRPC_PORT + NODE_ID )) \
                          --ws-port $(( WS_PORT + NODE_ID )) \
                          --port $(( NETWORK_PORT + NODE_ID )) \
                          -d /tmp/parity-$NODE_ID \
                          --bootnodes enode://$BOOTNODE@127.0.0.1:30400 & export NODE_$( echo $NODE_ID )_PID=$!
fi