#!/bin/sh
#
#######################################
# Get enode from a given ip
# Globals:
#   BOOTNODE_IP
# Arguments:
#   None
# Outputs:
#   ENODE
#######################################

if [ -z $BOOTNODE_IP ]; then
  BOOTNODE_IP="localhost"
  echo "Using default BOOTNODE_IP=$BOOTNODE_IP"
fi

if [ -z $BOOTNODE_PORT ]; then
  BOOTNODE_PORT="8545"
  echo "Using default BOOTNODE_PORT=$BOOTNODE_PORT"
fi

# curl enode
response=$(curl --silent --data '{"method":"parity_enode","params":[],"id":1,"jsonrpc":"2.0"}' -H "Content-Type: application/json" -X POST ${BOOTNODE_IP}:$BOOTNODE_PORT)
echo "  response: $response"

# filter json response
enode=$(jq ".result" <<< $response)
echo "  enode=$enode"
