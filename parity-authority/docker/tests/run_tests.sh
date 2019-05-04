export NETWORK_NAME=decentralized-energy-trading
export PARITY_VERSION=v2.4.5

echo "Sarting test network ..."

docker-compose up -d  &> /dev/null
export NODE_0="http://$(docker-compose port authority0 8545)"
export NODE_1="http://$(docker-compose port authority1 8545)"
export NODE_2="http://$(docker-compose port authority2 8545)"

echo "Sarting tests ..."
npm test
echo "Tests done!"

echo "Cleaning up ..."
docker-compose down -v &> /dev/null
echo "Done!"