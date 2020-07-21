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

if [ -z BOOTNODE_IP ]; then
  BOOTNODE_IP="localhost"
fi

# curl enode
response=$(curl --data '{"method":"parity_enode","params":[],"id":1,"jsonrpc":"2.0"}' -H "Content-Type: application/json" -X POST $BOOTNODE_IP:8545)
echo "r: $response"

# filter json response
enode=$(jq ".result" <<< $response)
echo "enode=$enode"
