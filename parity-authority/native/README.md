# Parity PoA Nodes
The Proof-of-Authority nodes used in our private network.

### Requirements

- [Parity](https://www.parity.io/)
- [Ethereum go Client](https://github.com/ethereum/go-ethereum)
- [Node.js](https://nodejs.org/en/)

## Nodes

### Boot Node
Node with the only task is to connect a new node to the network. Once this node is part of the network it doesn't rely on the boot node anymore.

#### Setup
Run the following command:

```sh
./setup_bootnode.sh
```

### Authority Node
Node that is able to sign new blocks.

#### Setup
To setup your first authority node run the following command:

```sh
./setup_node.sh
```

For further nodes just prepend the envarriamental variable `NODE_ID` to a number different than `0`. Example for a second node:
```sh
NODE_ID=1 ./setup_node.sh
```

### Setup a Test Network

1. Setup one boot node ( _always first!_ )
2. Setup authority as many authority nodes as you like

Example of a test network with one bootnode and four authority nodes:

![](https://bit.ly/2vEZ1LK)


## Tests
Before running the tests make sure you installed al the npm related packages by running:

```sh
npm install
```
To run the tests:
```
./run_tests.sh
```