# Deploy Containers

### Containers
- blogpvblossom/openethereum

### Usage

```bash
# Start bootnode container
$ docker run -d -e NODE_NAME=Node0 -p 8545:8545 -p 8546:8546 -p 8180:8180 -p 30303:30303 blogpvblossom/openethereum --unsafe-expose --jsonrpc-cors all --fast-unlock
```

```bash
# In folder .../openethereum/3_deploy/
$ docker-compose up
```

```bash
# In folder .../openethereum/3_deploy/
$ docker-compose down
```

### Environment Settings
You can change configurations for a single container. To configure a single container, use [OpenEthereum CLI options](https://openethereum.github.io/wiki/Configuring-OpenEthereum) in the docker `--command`. A few configurations must not be changed by `--command`:
- `-c`, `--config`: File containing the node config. 

You can set additional configurations via the Docker environemnt using `-e`:
- `BOOTNODE` (default="")
- `ACCOUNT_PASSWORD`(deafult=paSSword)
- `CHAIN_NAME` (deafult=blogpv)
- `NODE_NAME`: (default=node0)