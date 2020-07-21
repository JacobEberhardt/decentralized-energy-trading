#!/bin/bash
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

max_tries=100
counter=0
while [[ $counter -lt $max_tries ]]; do
# curl enode
  response=$(curl --silent --data '{"method":"parity_enode","params":[],"id":1,"jsonrpc":"2.0"}' -H "Content-Type: application/json" -X POST ${BOOTNODE_IP}:$BOOTNODE_PORT)
  ((counter++))

  # filter json response
  result=$(jq ".result" <<< $response)
  echo "  filtered = $result"

  if [ -z $result ] || [ "$result" == "null" ]; then
    sleep 1
    continue
  fi

  echo "  enode = $result"
  break

done