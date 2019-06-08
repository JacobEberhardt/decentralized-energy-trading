echo "Staring Admin Node ..."
echo $HHS_PORT
service mongodb start
echo "Staring Parity Node ..."
parity account list --config parity/authority.toml > authority_address
parity --config ./parity/authority.toml --engine-signer $(cat authority_address) &> /dev/null

yarn migrate-contracts-authority

echo "Staring Household Server ..."
yarn run-server -a $(cat authority_address) -P $(cat ./parity/authority.pwd) &> /dev/null
cd household-ui/
echo "Staring Household UI ..."
echo REACT_APP_HSS_PORT=${HHS_PORT} > .env
yarn start