echo "Staring Node ..."
echo "With password: $PASSWORD"
echo $PASSWORD > parity/authority.pwd
service mongodb start
echo "Staring Parity Node ..."
export ACCOUNT=$(parity account new --config parity/authority.toml)
yarn compile-contracts
parity --config parity/authority.toml --engine-signer $ACCOUNT --ws-origins="*" &> /dev/null

echo "Staring Household Server ..."
yarn run-server -a $ACCOUNT -P $(cat parity/authority.pwd) &> /dev/null
cd household-ui/
echo "Staring Household UI at port $HHS_PORT ..."
echo REACT_APP_HSS_PORT=$HHS_PORT > .env
yarn start