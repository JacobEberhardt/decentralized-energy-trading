echo "Starting bootnode ..."
source ./setup_bootnode.sh --test &> /dev/null


echo "Starting node #0 ..."
source ./setup_node.sh --test &> /dev/null

echo "Starting node #1 ..."
export NODE_ID=1
source  ./setup_node.sh --test &> /dev/null

echo "Starting tests ..."
npm test
echo "Tests finished!"

echo "Clean up ..."
kill -9 $BOOTNODE_PID
kill -9 $NODE_0_PID
kill -9 $NODE_1_PID
echo "Done!"