#!/bin/sh

# This script serves as an entry point replacement for a docker container. It allows to hook custom code while preserving additional configs given bei command.

#!/bin/sh

# run various pieces of initialization code here
# ...
echo "Running init.sh"

# Requires environment variables:
# ACCOUNT_PASSWORD
# CHAIN_NAME
# NODE_NAME


# Node password file
echo "Setting ACCOUNT_PASSWORD=$ACCOUNT_PASSWORD in file /home/blogpv/bootnode_account.pwd ..."
echo "${ACCOUNT_PASSWORD}" > /home/blogpv/node_account.pwd

# echo "/home/blogpv/node_account.pwd contains: $(cat /home/blogpv/node_account.pwd)"
# TODO SET ACCESS RIGHT!
# TODO DELETE PASSWORD FROM MEMORY!

# Node account
# echo "Creating account for ACCOUNT_PASSWORD=$ACCOUNT_PASSWORD ..."
rm -Rf /home/openethereum/.local/share/io.parity.ethereum/keys/ethereum
ACCOUNT_ADDRESS=$(/home/openethereum/openethereum account new --password /home/blogpv/node_account.pwd)
ACCOUNT_KEYFILE_NAME=$(ls /home/openethereum/.local/share/io.parity.ethereum/keys/ethereum/)
# echo "ACCOUNT_ADDRESS=$ACCOUNT_ADDRESS"
# echo "Keyfile: $ACCOUNT_KEYFILE_NAME"

# echo "bootnode_address: $(cat /home/blogpv/bootnode_address)"

# Chain config
echo "Creating node config from /home/blogpv/template-chain.json ..."
echo "Setting ACCOUNT_ADDRESS=$ACCOUNT_ADDRESS in file /home/blogpv/chain.json ..."
sed \
-e "s/{ ACCOUNT_ADDRESS }/$ACCOUNT_ADDRESS/" \
-e "s/{ CHAIN_NAME }/$CHAIN_NAME/" \
/home/blogpv/template-chain.json > /home/blogpv/chain.json

# Getting BOOTNODE
# TODO Check for bootnode_ip
# IF Bootnode_ip:
# curl until bootnode
# Add bootnode to BOOTNODE_ENODE

# Node config
echo "Setting ENGINE_SIGNER=$ACCOUNT_ADDRESS from /home/blogpv/template-node.toml ..."
echo "Setting NODE_NAME=$NODE_NAME in file /home/blogpv/node_config.toml ..."
sed \
-e "s/{ ENGINE_SIGNER }/$ACCOUNT_ADDRESS/" \
-e "s/{ NODE_NAME }/$NODE_NAME/" \
-e "s/{ BOOTNODE }/$BOOTNODE" \
/home/blogpv/template-node.toml > /home/blogpv/node_config.toml

# Importing keys
echo "Importing keystore file to chain $CHAIN_NAME"
mkdir -p /home/blogpv/keys/$CHAIN_NAME/

/home/openethereum/openethereum account import \
-c /home/blogpv/node_config.toml \
/home/openethereum/.local/share/io.parity.ethereum/keys/ethereum/$ACCOUNT_KEYFILE_NAME
rm -f /home/openethereum/.local/share/io.parity.ethereum/keys/ethereum/$ACCOUNT_KEYFILE_NAME

# echo "Imported keys: $(ls /home/blogpv/keys/$CHAIN_NAME/)"
# echo "/home/blogpv/keys/$CHAIN_NAME/$ACCOUNT_KEYFILE_NAME: $(cat /home/blogpv/keys/$CHAIN_NAME/$ACCOUNT_KEYFILE_NAME)"

# Create DB directory
mkdir -p /home/blogpv/chains/

/home/openethereum/openethereum --chain /home/blogpv/chain.json account list

# Output result
echo "Node config - /home/blogpv/node_config.toml:"
echo "$(cat /home/blogpv/node_config.toml)"

echo "Chain config - /home/blogpv/chain.json:"
echo "$(cat /home/blogpv/chain.json)"

echo "Keystore file - /home/blogpv/keys/$CHAIN_NAME/$ACCOUNT_KEYFILE_NAME:"
echo "$(cat /home/blogpv/keys/$CHAIN_NAME/$ACCOUNT_KEYFILE_NAME)"

echo "CHAIN_NAME           = $CHAIN_NAME"
echo "NODE_NAME            = $NODE_NAME"
echo "ACCOUNT_PASSWORD     = $ACCOUNT_PASSWORD"
echo "ACCOUNT_ADDRESS      = $ACCOUNT_ADDRESS"
echo "ACCOUNT_KEYFILE_NAME = $ACCOUNT_KEYFILE_NAME"
echo "ACCOUNT_KEYFILE      = /home/blogpv/keys/$CHAIN_NAME/$ACCOUNT_KEYFILE_NAME" 

# Execute the upstream command:
exec /home/openethereum/openethereum "$@"