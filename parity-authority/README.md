# Parity PoA Test Chain
This sets up a Proof-of-Authority test chain using Parity. It is based on https://github.com/orbita-center/parity-poa-playground.git and customized to the needs of this project.

### Setup

0. Install [docker](https://docs.docker.com/engine/installation/) and [docker-compose](https://docs.docker.com/compose/install/)
1. Make sure you are in the `parity-authority` directory
2. Run `docker-compose up` or add `-d` flag for silence mode


### Cleanup
If you want to do a cleanup of the volumes and containers run `docker-compose down -v`. 

### Access the [ethstats](https://github.com/cubedro/eth-netstats) dashboard.
A nice dashboard is already configured and connected with all the nodes.
Find it at [http://127.0.0.1:3001](http://127.0.0.1:3001).

### Accounts

#### Authorities
The JSON key and password files of the authority nodes are under `./parity/authorities`.

#### Pre-funded Account
There is already an account with an empty password that has enough ether:
```
0x6B0c56d1Ad5144b4d37fa6e27DC9afd5C2435c3B
```

### Access JSON RPC 
Talk to JSON RPC at [http://127.0.0.1:8545](http://127.0.0.1:8545) with your favorite client.
