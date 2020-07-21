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

# curl enode
response=$(curl --data '{"method":"parity_enode","params":[],"id":1,"jsonrpc":"2.0"}' -H "Content-Type: application/json" -X POST localhost:8545)
echo "r: $response"