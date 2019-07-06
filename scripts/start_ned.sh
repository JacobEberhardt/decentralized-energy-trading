echo "Staring NED Processing Unit ..."

echo "Staring Parity Node ..."
parity account list --config /parity/authority.toml > authority_address
parity --config /parity/authority.toml --engine-signer $(cat authority_address) &> /dev/null

yarn migrate-contracts-authority

echo "Staring Ned Server ..."
yarn run-ned