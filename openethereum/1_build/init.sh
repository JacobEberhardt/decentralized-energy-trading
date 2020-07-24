#!/bin/bash
##################################################
# This script is a hook for the container entry point. A 
# hook executes custom code but preserves the original 
# entrypoint with command. 
# 
# Globals:
#  ACCOUNT_PASSWORD Password of the engine signer acc
#  ACCOUNT_ADDRESS  The address of the signer acc
#  BOOTNODE_IP      IP4 add of a bootnode
#  BOOTNODE_PORT    RPC port of of a bootnode
#  CHAIN_NAME       Name of the chain
#  ENODE            Enode of node
# TODOs:
#  Ignore -d in CMD
#  Ignore -c in CMD
#  Ignore --chain in CMD
##################################################


##################################################
# Get enode from a remote ethereum node. 
# 
# Globals:
#  BOOTNODE_IP     IP4 add of a bootnode
#  BOOTNODE_PORT   RPC port of of a bootnode
#  ENODE           Enode of ethereum node
##################################################
function get_enode {
  if [ -z $BOOTNODE_IP ]; then
    BOOTNODE_IP="localhost"
  fi

  if [ -z $BOOTNODE_PORT ]; then
    BOOTNODE_PORT="8545"
  fi

  local max_tries=100
  local counter=0
  while [[ $counter -lt $max_tries ]]; do
    # curl bootnode
    local response=$(curl --silent --data '{"method":"parity_enode","params":[],"id":1,"jsonrpc":"2.0"}' -H "Content-Type: application/json" -X POST ${BOOTNODE_IP}:$BOOTNODE_PORT)
    ((counter++))

    # filter json response
    result=$(jq ".result" <<< $response)

    if [ -z $result ] || [ "$result" == "null" ]; then
      sleep 1
      continue
      else
        # echo "result=$result"
        #ENODE="${result:1:-1}"
        # echo "$ENODE=ENODE"
        ENODE=$result
        break
    fi

  done
}

echo "Running init.sh"

if [[ -z $NODE_NAME ]]; then
  NODE_NAME=node0
fi

if [[ -z $ACCOUNT_PASSWORD ]]; then
  ACCOUNT_PASSWORD=paSSword
fi

if [[ -z $CHAIN_NAME ]]; then
  CHAIN_NAME=blogpv
fi

# Node password file
echo "Setting ACCOUNT_PASSWORD=$ACCOUNT_PASSWORD in file /home/blogpv/bootnode_account.pwd ..."
echo "${ACCOUNT_PASSWORD}" > /home/blogpv/node_account.pwd

echo "/home/blogpv/node_account.pwd contains: $(cat /home/blogpv/node_account.pwd)"
# TODO SET ACCESS RIGHT!
# TODO DELETE PASSWORD FROM MEMORY!

# Authority account
echo "Creating account for ACCOUNT_PASSWORD=$ACCOUNT_PASSWORD ..."
rm -Rf /home/openethereum/.local/share/io.parity.ethereum/keys/ethereum
ACCOUNT_ADDRESS=$(/home/openethereum/openethereum account new --password /home/blogpv/node_account.pwd)
ACCOUNT_KEYFILE_NAME=$(ls /home/openethereum/.local/share/io.parity.ethereum/keys/ethereum/)
echo "ACCOUNT_ADDRESS=$ACCOUNT_ADDRESS"
echo "Keyfile: $ACCOUNT_KEYFILE_NAME"
cat /home/openethereum/.local/share/io.parity.ethereum/keys/ethereum/$ACCOUNT_KEYFILE_NAME

# Node key
mkdir -p /home/blogpv/network

# Chain config
echo "Creating node config from /home/blogpv/template-chain.json ..."
# echo "Setting ACCOUNT_ADDRESS=$ACCOUNT_ADDRESS in file /home/blogpv/chain.json ..."
sed \
-e "s/{ ACCOUNT_ADDRESS }/$ACCOUNT_ADDRESS/" \
-e "s/{ CHAIN_NAME }/$CHAIN_NAME/" \
/home/blogpv/template-chain.json > /home/blogpv/chain.json

# echo "Chain config - /home/blogpv/chain.json:"
# echo "$(cat /home/blogpv/chain.json)"

# Getting BOOTNODE
if [ $BOOTNODE_IP ]; then
  get_enode
  BOOTNODE=$ENODE
fi

# Node config
echo "Setting ENGINE_SIGNER=$ACCOUNT_ADDRESS from /home/blogpv/template-node.toml ..."

sed \
-e "s|{ ENGINE_SIGNER }|$ACCOUNT_ADDRESS|" \
-e "s|{ NODE_NAME }|$NODE_NAME|" \
-e "s|{ BOOTNODE }|$BOOTNODE|" \
/home/blogpv/template-node.toml > /home/blogpv/node_config.toml

echo "Node config - /home/blogpv/node_config.toml:"
echo "$(cat /home/blogpv/node_config.toml)"

# Importing keys
echo "Importing keystore file to chain $CHAIN_NAME ..."
mkdir -p /home/blogpv/keys/$CHAIN_NAME/

/home/openethereum/openethereum account import \
-c /home/blogpv/node_config.toml \
/home/openethereum/.local/share/io.parity.ethereum/keys/ethereum/$ACCOUNT_KEYFILE_NAME

ls -lsa /home/blogpv/keys/$CHAIN_NAME/

rm -f /home/openethereum/.local/share/io.parity.ethereum/keys/ethereum/$ACCOUNT_KEYFILE_NAME

# echo "Imported keys: $(ls /home/blogpv/keys/$CHAIN_NAME/)"
# echo "/home/blogpv/keys/$CHAIN_NAME/$ACCOUNT_KEYFILE_NAME: $(cat /home/blogpv/keys/$CHAIN_NAME/$ACCOUNT_KEYFILE_NAME)"

# Create DB directory
mkdir -p /home/blogpv/chains/

echo "Listing accoounts for chain $CHAIN_NAME ..."
/home/openethereum/openethereum -c /home/blogpv/node_config.toml account list

# Output result
echo "Keystore file - /home/blogpv/keys/$CHAIN_NAME/$ACCOUNT_KEYFILE_NAME:"
echo "$(cat /home/blogpv/keys/$CHAIN_NAME/$ACCOUNT_KEYFILE_NAME)"

echo "CHAIN_NAME           = $CHAIN_NAME"
echo "NODE_NAME            = $NODE_NAME"
echo "ACCOUNT_PASSWORD     = $ACCOUNT_PASSWORD"
echo "ACCOUNT_ADDRESS      = $ACCOUNT_ADDRESS"
echo "ACCOUNT_KEYFILE_NAME = $ACCOUNT_KEYFILE_NAME"
echo "ACCOUNT_KEYFILE      = /home/blogpv/keys/$CHAIN_NAME/$ACCOUNT_KEYFILE_NAME"
echo "BOOTNODE             = $BOOTNODE"

# Execute the upstream command:
echo "Params passed by --command=$@"
exec /home/openethereum/openethereum -c /home/blogpv/node_config.toml "$@"