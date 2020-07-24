# Operating a Private OpenEthereum PoA Network

## Fundamentals 

- [Building container image](1_build/README.md)
- [Provisioning container hosts](2_provison/README.md)
- [Deploying containers](3_deploy/README.md)

## Design

#### Custom Container Init Pattern
**Problem**: How can we run custom code at container startup without violating contianer best practices and preserving parameters passed by the command flag?

**Solution**: ([source](https://stackoverflow.com/questions/42280792/reuse-inherited-images-cmd-or-entrypoint)). We create a script `init.sh`. The script becomes the new `ENTRYPOINT` of the container. The last command of `init.sh` executes the old `ENTRYPOINT` with all params of `init.sh` to preserve options from `CMD`. It uses `exec` to ensure PID is `1`.

**Improvement**: Consider using `init` in Docker Compose file ([docs](https://docs.docker.com/compose/compose-file/#init)).


#### OpenEthereum RPC

Create an account with password (see [docs](https://openethereum.github.io/wiki/JSONRPC-personal-module#personal_newaccount)):
```
$ curl --data '{"method":"personal_newAccount","params":["hunter2"],"id":1,"jsonrpc":"2.0"}' -H "Content-Type: application/json" -X POST localhost:8545
```

#### Foundations for Operation
[Dive](https://github.com/wagoodman/dive) allows to inspect Docker images. We inspect the image `openethereum/openethereum:v3.0.0`. 
```
$ dive openethereum/openethereum:v3.0.0
```

Some files and directories are specifc to operating an openethereum client. These files and directories are:
```
drwxr-xr-x   ├── home
drwxr-xr-x   │       ├── .local
drwxr-xr-x   │       │   └── share
drwxr-xr-x   │       │       └── io.parity.ethereum  
-rwxr-xr-x   │       └── openethereum  
```

We use `docker container inspect`to identify entrypoint and command:
```
$ docker image inspect blogpvblossom/openethereum
[...]
            "Cmd": [
                "/bin/sh",
                "-c",
                "#(nop) ",
                "USER openethereum"
            ],
            "WorkingDir": "/home/openethereum",
            "Entrypoint": [
                "./openethereum"
            ],
[...]
```


##### Base Directory
The `$BASE` directory contains all working data of a node. However, we do not know where the `$BASE` directory resides per default. This is very bad for operation. Thus, we set it. This is done at client start using options. The options are `-d` or `--base-path`.

What path should we select for the `$BASE`directory? The [OpenEthereum documentation for Docker](https://openethereum.github.io/wiki/Docker) proses a custom path. The path is `/home/openethereum/.local/share/openethereum/`. We use `/home/blogpv/`.

##### Node Configuration
A client can have node specifc configurations. We have two possibilites to set node configurations. First, we pass options at client start. Second, we specify configurations in a file. We refer to this file as *node config*. We choose a node config for succinct and version controlable specification. 

How can we set the node config? The default location of the node config is `$BASE/config.toml`. Alternatively, we can specify a custom path using `-c` or `--config`. We chose the default option.

##### Chain Specification (Private Network)
Node in a private network must agree on a set of common configurations. Similar to the node config, we can set network configurations via options or file. This file is commonly called *chain specification* or *chain spec*. We chose a file.

How can we set the chain spec? We can specifiy a custom path to a file in two ways. First, we set the option ``--chain``. Second, set a path in the node config using `chain` (see [docs](https://openethereum.github.io/wiki/Configuring-OpenEthereum)).

##### PoA Chain
We want to use PoA consensus. What information do we need for enabling PoA consensus? 

We can configure the consensus algorithm in a private network in the chain specification under the propertie `engine`. OpenEthereum supports different [consensus algorithms](https://openethereum.github.io/wiki/Pluggable-Consensus). The only PoA consensus algorithm (currently) supported is Aura. We use Aura with the property `authorityRound`. PoA requires validators. A validator is represented by the address of the entity. We have four options to set `validators`: `list`, `safeContract`, `contract`, and `multi`. `list` defines a static list of addresses. `safeContract` and `contract` define a dynamic list of addresses.

For the first proof-of-concept, we use `list`and migrate to `contract` for the final prototype.

### First Signer



### Secret Store


### Customized Image
| CLI Option      | TOML            | Time  | Value                    |       
|:----------------|:----------------|------:|:-------------------------|
| `base-path`     | `base_path`     | build | `$HOME/blogpv`           |
| `chain`         | `chain`         | build | `$HOME/blogpv/chain.json`|
| `db-path`       | `db_path`       | build | `$HOME/blogpv/chains`    |
| `keys-path`     | `keys_path`     | build | `$HOME/blogpv/keys`      |
| `identity`      | `identity`      | run   | `$NODE_NAME`             |
| `engine-signer` | `engine_signer` | run   | `$SIGNER_ADDRESS`        | 


### Node Types

#### Bootnode
- The bootnode becomes validator
- The bootnode becomes an account with tones of ether
- The bootnode stores its password in a file references under --password




### Options

#### Operating Options
| Option      | Default | Description  |
|:------------|------:|:-------------|
| `--no-download` | `false` | Normally new releases will be downloaded ready for updating. This disables it. Not recommended. |
| `--no-consensus` | `false` | Force the binary to run even if there are known issues regarding consensus. Not recommended. |
| `--force-direct` | `false` | Run the originally installed version of the client, ignoring any updates that have since been installed. |
| `--mode=[MODE]` | `last` | Set the operating mode. MODE can be one of: last - Uses the last-used mode, active if none; active - client continuously syncs the chain; passive - client syncs initially, then sleeps and wakes regularly to resync; dark - client syncs only when the JSON-RPC is active; offline - client doesn't sync. |
| `--mode-timeout=[SECS]` | `300` | Specify the number of seconds before inactivity timeout occurs when mode is dark or passive. |
| `--mode-alarm=[SECS]` | `3600` | Specify the number of seconds before auto sleep reawake timeout occurs when mode is passive. |
| **`--chain=[CHAIN]`** | `foundation` | Specify the blockchain type. CHAIN may be either a JSON chain specification file or ethereum, classic, poacore,tobalaba, expanse, musicoin, ellaism, easthub, social, olympic, morden, ropsten, kovan, poasokol, testnet, or dev. |
| **`--keys-path=[PATH]`** | `$BASE/keys` | Specify the path for JSON key files to be found. |
| **`--identity=[NAME]`** | `""` | Specify your node's name. |
| **`-d, --base-path=[PATH]`** | ? | Specify the base data storage path. |
| **`--db-path=[PATH]`** | ? | Specify the database directory path. |

#### Convenience Options
| Option      | Default | Description  |
|:------------|--------:|:-------------|
| `--unsafe-expose` | ? | All servers will listen on external interfaces and will be remotely accessible. It's equivalent with setting the following: --[ws,jsonrpc,ui,ipfs-api,secretstore,stratum,dapps,secretstore-http-interface=all --*-hosts=all    This option is UNSAFE and should be used with great care! |
| `-c`, `--config=[CONFIG]` | `$BASE/config.toml` | Specify a configuration. CONFIG may be either a configuration file or a preset: dev, insecure, dev-insecure, mining, or non-standard-ports. |
| `ports-shift=[SHIFT]` | `0` | Add SHIFT to all port numbers client is listening on. Includes network port and all servers (HTTP JSON-RPC, WebSockets JSON-RPC, IPFS, SecretStore). |

#### Account Options
| Option      | Default | Description |
|:------------|--------:|:-------------|
| `--no-hardware-wallets` | ? |Disables hardware wallet support. |
| `--fast-unlock` | ? | Use drastically faster unlocking mode. This setting causes raw secrets to be stored unprotected in memory, so use with care. |
| `--keys-iterations=[NUM]` | `10240` | Specify the number of iterations to use when deriving key from the password (bigger is more secure). |
| `--accounts-refresh=[TIME]` | `5` | Specify the cache time of accounts read from disk. If you manage thousands of accounts set this to 0 to disable refresh. |
| `--unlock=[ACCOUNTS]` | ? | Unlock ACCOUNTS for the duration of the execution. ACCOUNTS is a comma-delimited list of addresses. Implies `--no-ui`. |
| `--enable-signing-queue=[BOOLEAN]` | `false` | Enables the signing queue for external transaction signing either via CLI or personal_unlockAccount, turned off by default. |
| `--password=[FILE]` | `[]` | Provide a file containing a password for unlocking an account. Leading and trailing whitespace is trimmed. |

#### UI Options
| Option      | Default | Description |
|:------------|--------:|:-------------|
| `--ui-path=[PATH]` | `$BASE/signer` | Specify directory where Trusted UIs tokens should be stored. |

#### Networking Options
| Option      | Default | Description |
|:------------|--------:|:-------------|
| `--no-warp` | `false` | Disable syncing from the snapshot over the network. |
| `--no-discovery` | `false` | Disable new peer discovery. |
| `--reserved-only` | `false` | Connect only to reserved nodes. |
| ` --no-ancient-blocks` | `false` | Disable downloading old blocks after snapshot restoration or warp sync. Not recommended. |
| `--warp-barrier=[NUM]` | ? | When warp enabled never attempt regular sync before warping to block NUM. |
| `--port=[PORT]` | `30303` | Override the port on which the node should listen. |
| `--interface=[IP]` | `all` |  Network interfaces. Valid values are 'all', 'local' or the ip of the interface you want client to listen to. |
| `--min-peers=[NUM]` | ? | Try to maintain at least NUM peers. |
| `--max-peers=[NUM]` | ? |  Allow up to NUM peers. |
| `--snapshot-peers=[NUM]` | `0` | Allow additional NUM peers for a snapshot sync.|
| `--nat=[METHOD]` | `any` | Specify method to use for determining public address. Must be one of: any, none, upnp, extip:<IP>. |
| `--allow-ips=[FILTER]` | `all` | Filter outbound connections. Must be one of: private - connect to private network IP addresses only; public - connect to public network IP addresses only; all - connect to any IP address. |
| `--max-pending-peers=[NUM]` | `64` | Allow up to NUM pending connections. |
| `--network-id=[INDEX]` | ? |  Override the network identifier from the chain we are on. |
| **`--bootnodes=[NODES]`** | ? |  Override the bootnodes from our chain. NODES should be comma-delimited enodes. |
| **`--node-key=[KEY]`** | ? | Specify node secret key, either as 64-character hex string or input to SHA3 operation.'
| `--reserved-peers=[FILE]` | ? | Provide a file containing enodes, one per line. These nodes will always have a reserved slot on top of the normal maximum peers. |

#### API and Console Options – HTTP JSON-RPC:
| Option      | Default | Description |
|:------------|--------:|:-------------|
| `--no-jsonrpc` | `false` | Disable the HTTP JSON-RPC API server. |
| `--jsonrpc-port=[PORT]` | `8545`| Specify the port portion of the HTTP JSON-RPC API server. |
| `--jsonrpc-interface=[IP]`| `local`| Specify the hostname portion of the HTTP JSON-RPC API server, IP should be an interface's IP address, or all (all interfaces) or local. |
| `--jsonrpc-apis=[APIS]` | `web3, eth, pubsub, net, parity, private, parity_pubsub, traces, rpc` | Specify the APIs available through the HTTP JSON-RPC interface using a comma-delimited list of API names. Possible names are: `all`, `safe`, `debug`, `web3`, `net`, `eth`, `pubsub`, `personal`, `signer`, `parity`, `parity_pubsub`, `parity_accounts`, `parity_set`, `traces`, `rpc`, `secretstore`. You can also disable a specific API by putting `-` in the front, example: `all,-personal`. `safe` enables the following APIs: web3, net, eth, pubsub, parity, parity_pubsub, traces, rpc. |
| `--jsonrpc-hosts=[HOSTS]` | `none`| List of allowed Host header values. This option will validate the Host header sent by the browser, it is additional security against some attack vectors. Special options: `all`, `none`. |
| `--jsonrpc-cors=[URL]` | `none` | Specify CORS header for HTTP JSON-RPC API responses. Special options: `all`, `none`. |
| `--jsonrpc-server-threads=[NUM]` | ? | Enables multiple threads handling incoming connections for HTTP JSON-RPC server. |
| `--jsonrpc-max-payload=[MB]` | ? | Specify maximum size for HTTP JSON-RPC requests in megabytes. |

#### API and Console Options – WebSockets:
| Option      | Default | Description |
|:------------|--------:|:-------------|
| `--no-ws` | `false` | Disable the WebSockets JSON-RPC server. |
| `--ws-port=[PORT]`| `8546`| Specify the port portion of the WebSockets JSON-RPC server. |
| `--ws-interface=[IP]`| `local`| Specify the hostname portion of the WebSockets JSON-RPC server, IP should be an interface's IP address, or all (all interfaces) or local. |
| `--ws-apis=[APIS]`| web3, eth, pubsub, net, parity, parity_pubsub, private, traces | Specify the JSON-RPC APIs available through the WebSockets interface using a comma-delimited list of API names. Possible names are: all, safe, web3, net, eth, pubsub, personal, signer, parity, parity_pubsub,parity_accounts, parity_set, traces, rpc, secretstore.You can also disable a specific API by putting '-' in the front, example: all,-personal. 'safe' enables the following APIs: web3, net, eth, pubsub, parity, parity_pubsub, traces, rpc |
| `--ws-origins=[URL]`| `parity://*,chrome-extension://*,moz-extension://*`| Specify Origin header values allowed to connect. Special options: `all`, `none`. |
| `--ws-hosts=[HOSTS]`| `none`| List of allowed Host header values. This option will validate the Host header sent by the browser, it is additional security against some attack vectors. Special options: "all", "none". |
| `--ws-max-connections=[CONN]` | `100` | Maximum number of allowed concurrent WebSockets JSON-RPC connections. |

#### API and Console Options – IPC:
    --no-ipc
        Disable JSON-RPC over IPC service.

    --ipc-path=[PATH]
        Specify custom path for JSON-RPC over IPC service.
        (default: $BASE/jsonrpc.ipc)

   --ipc-chmod=[NUM]
        Specify octal value for ipc socket permissions (unix/bsd only) (default: 660)

    --ipc-apis=[APIS]
        Specify custom API set available via JSON-RPC over IPC
        using a comma-delimited list of API names. Possible
        names are: all, safe, web3, net, eth, pubsub, personal,
        signer, parity, parity_pubsub, parity_accounts,
        parity_set, traces, rpc, secretstore, shh, shh_pubsub.
        You can also disable a specific API by putting '-' in
        the front, example: all,-personal. 'safe' enables the
        following APIs: web3, net, eth, pubsub, parity,
        parity_pubsub, traces, rpc, shh, shh_pubsub (default:
        web3,eth,pubsub,net,parity,parity_pubsub,parity_accounts
        ,private,traces,rpc,shh,shh_pubsub)

#### API and Console Options – IPFS:
    --ipfs-api
        Enable IPFS-compatible HTTP API.

    --ipfs-api-port=[PORT]
        Configure on which port the IPFS HTTP API should listen.
        (default: 5001)

    --ipfs-api-interface=[IP]
        Specify the hostname portion of the IPFS API server, IP
        should be an interface's IP address or local. (default:
        local)

    --ipfs-api-hosts=[HOSTS]
        List of allowed Host header values. This option will
        validate the Host header sent by the browser, it is
        additional security against some attack vectors. Special
        options: "all", "none". (default: none)

    --ipfs-api-cors=[URL]
        Specify CORS header for IPFS API responses. Special
        options: "all", "none". (default: none)

#### Secret Store Options:
    --no-secretstore
        Disable Secret Store functionality.

    --no-secretstore-http
        Disable Secret Store HTTP API.

    --no-secretstore-auto-migrate
        Do not run servers set change session automatically when
        servers set changes. This option has no effect when
        servers set is read from configuration file.

    --secretstore-acl-contract=[SOURCE]
        Secret Store permissioning contract address source:
        none, registry (contract address is read from
        'secretstore_acl_checker' entry in registry) or address.
        (default: registry)

    --secretstore-contract=[SOURCE]
        Secret Store Service contract address source: none,
        registry (contract address is read from
        'secretstore_service' entry in registry) or address.

    --secretstore-srv-gen-contract=[SOURCE]
        Secret Store Service server key generation contract
        address source: none, registry (contract address is read
        from 'secretstore_service_srv_gen' entry in registry) or
        address.

    --secretstore-srv-retr-contract=[SOURCE]
        Secret Store Service server key retrieval contract
        address source: none, registry (contract address is read
        from 'secretstore_service_srv_retr' entry in registry)
        or address.

    --secretstore-doc-store-contract=[SOURCE]
        Secret Store Service document key store contract address
        source: none, registry (contract address is read from
        'secretstore_service_doc_store' entry in registry) or
        address.

    --secretstore-doc-sretr-contract=[SOURCE]
        Secret Store Service document key shadow retrieval
        contract address source: none, registry (contract
        address is read from 'secretstore_service_doc_sretr'
        entry in registry) or address.

    --secretstore-nodes=[NODES]
        Comma-separated list of other secret store cluster nodes
        in form NODE_PUBLIC_KEY_IN_HEX@NODE_IP_ADDR:NODE_PORT.
        (default: )

    --secretstore-server-set-contract=[SOURCE]
        Secret Store server set contract address source: none,
        registry (contract address is read from
        'secretstore_server_set' entry in registry) or address.
        (default: registry)

    --secretstore-interface=[IP]
        Specify the hostname portion for listening to Secret
        Store Key Server internal requests, IP should be an
        interface's IP address, or local. (default: local)

    --secretstore-port=[PORT]
        Specify the port portion for listening to Secret Store
        Key Server internal requests. (default: 8083)

    --secretstore-http-interface=[IP]
        Specify the hostname portion for listening to Secret
        Store Key Server HTTP requests, IP should be an
        interface's IP address, or local. (default: local)

    --secretstore-http-port=[PORT]
        Specify the port portion for listening to Secret Store
        Key Server HTTP requests. (default: 8082)

    --secretstore-path=[PATH]
        Specify directory where Secret Store should save its
        data. (default: $BASE/secretstore)

    --secretstore-secret=[SECRET]
        Hex-encoded secret key of this node.

    --secretstore-admin=[PUBLIC]
        Hex-encoded public key of secret store administrator.

#### Sealing/Mining Options:
    --force-sealing
        Force the node to author new blocks as if it were always
        sealing/mining.

    --reseal-on-uncle
        Force the node to author new blocks when a new uncle
        block is imported.

    --remove-solved
        Move solved blocks from the work package queue instead
        of cloning them. This gives a slightly faster import
        speed, but means that extra solutions submitted for the
        same work package will go unused.

    --tx-queue-no-unfamiliar-locals
        Local transactions sent through JSON-RPC (HTTP,
        WebSockets, etc) will be treated as 'external' if the
        sending account is unknown.

    --tx-queue-no-early-reject
        Disables transaction queue optimization to early reject
        transactions below minimal effective gas price. This
        allows local transactions to always enter the pool,
        despite it being full, but requires additional ecrecover
        on every transaction.

    --refuse-service-transactions
        Always refuse service transactions.

    --infinite-pending-block
        Pending block will be created with maximal possible gas
        limit and will execute all transactions in the queue.
        Note that such block is invalid and should never be
        attempted to be mined.

    --no-persistent-txqueue
        Don't save pending local transactions to disk to be
        restored whenever the node restarts.

    --stratum
        Run Stratum server for miner push notification.

    --reseal-on-txs=[SET]
        Specify which transactions should force the node to
        reseal a block. SET is one of: none - never reseal on
        new transactions; own - reseal only on a new local
        transaction; ext - reseal only on a new external
        transaction; all - reseal on all new transactions.
        (default: own)

    --reseal-min-period=[MS]
        Specify the minimum time between reseals from incoming
        transactions. MS is time measured in milliseconds.
        (default: 2000)

    --reseal-max-period=[MS]
        Specify the maximum time since last block to enable
        force-sealing. MS is time measured in milliseconds.
        (default: 120000)

    --work-queue-size=[ITEMS]
        Specify the number of historical work packages which are
        kept cached lest a solution is found for them later.
        High values take more memory but result in fewer
        unusable solutions. (default: 20)

    --relay-set=[SET]
        Set of transactions to relay. SET may be: cheap - Relay
        any transaction in the queue (this may include invalid
        transactions); strict - Relay only executed transactions
        (this guarantees we don't relay invalid transactions,
        but means we relay nothing if not mining); lenient -
        Same as strict when mining, and cheap when not.
        (default: cheap)

    --usd-per-tx=[USD]
        Amount of USD to be paid for a basic transaction. The
        minimum gas price is set accordingly. (default: 0.0001)

    --usd-per-eth=[SOURCE]
        USD value of a single ETH. SOURCE may be either an
        amount in USD, a web service or 'auto' to use each web
        service in turn and fallback on the last known good
        value. (default: auto)

    --price-update-period=[T]
        T will be allowed to pass between each gas price update.
        T may be daily, hourly, a number of seconds, or a time
        string of the form "2 days", "30 minutes" etc..
        (default: hourly)

    --gas-floor-target=[GAS]
        Amount of gas per block to target when sealing a new
        block. (default: 8000000)

    --gas-cap=[GAS]
        A cap on how large we will raise the gas limit per block
        due to transaction volume. (default: 10000000)

    --tx-queue-mem-limit=[MB]
        Maximum amount of memory that can be used by the
        transaction queue. Setting this parameter to 0 disables
        limiting. (default: 4)

    --tx-queue-size=[LIMIT]
        Maximum amount of transactions in the queue (waiting to
        be included in next block). (default: 8192)

    --tx-queue-per-sender=[LIMIT]
        Maximum number of transactions per sender in the queue.
        By default it's 1% of the entire queue, but not less
        than 16.

    --tx-queue-strategy=[S]
        Prioritization strategy used to order transactions in
        the queue. S may be: gas_price - Prioritize txs with
        high gas price (default: gas_price)

    --stratum-interface=[IP]
        Interface address for Stratum server. (default: local)

    --stratum-port=[PORT]
        Port for Stratum server to listen on. (default: 8008)

    --min-gas-price=[STRING]
        Minimum amount of Wei per GAS to be paid for a
        transaction to be accepted for mining. Overrides --usd
        -per-tx.

    --gas-price-percentile=[PCT]
        Set PCT percentile gas price value from last 100 blocks
        as default gas price when sending transactions.
        (default: 50)

    --poll-lifetime=[S]
        Set the lifetime of the internal index filter to S
        seconds. (default: 60)

    --author=[ADDRESS]
        Specify the block author (aka "coinbase") address for
        sending block rewards from sealed blocks. NOTE: MINING
        WILL NOT WORK WITHOUT THIS OPTION.

    --engine-signer=[ADDRESS]
        Specify the address which should be used to sign
        consensus messages and issue blocks. Relevant only to
        non-PoW chains.

    --tx-gas-limit=[GAS]
        Apply a limit of GAS as the maximum amount of gas a
        single transaction may have for it to be mined.

    --tx-time-limit=[MS]
        Maximal time for processing single transaction. If
        enabled senders of transactions offending the limit will
        get other transactions penalized.

    --extra-data=[STRING]
        Specify a custom extra-data for authored blocks, no more
        than 32 characters.

    --notify-work=[URLS]
        URLs to which work package notifications are pushed.
        URLS should be a comma-delimited list of HTTP URLs.

    --stratum-secret=[STRING]
        Secret for authorizing Stratum server for peers.

#### Internal Options:
    --can-restart
        Executable will auto-restart if exiting with 69

#### Miscellaneous Options:
    --no-color
        Don't use terminal color codes in output.

    -v, --version
        Show information about version.

    --no-config
        Don't load a configuration file.

    -l, --logging=[LOGGING]
        Specify the general logging level (error, warn, info,
        debug or trace). It can also be set for a specific
        module, example: '-l sync=debug,rpc=trace'

    --log-file=[FILENAME]
        Specify a filename into which logging should be
        appended.

#### Footprint Options:
    --scale-verifiers
        Automatically scale amount of verifier threads based on
        workload. Not guaranteed to be faster.

    --tracing=[BOOL]
        Indicates if full transaction tracing should be enabled.
        Works only if client had been fully synced with tracing
        enabled. BOOL may be one of auto, on, off. auto uses
        last used value of this option (off if it does not
        exist). (default: auto)

    --pruning=[METHOD]
        Configure pruning of the state/storage trie. METHOD may
        be one of auto, archive, fast: archive - keep all state
        trie data. No pruning. fast - maintain journal overlay.
        Fast but 50MB used. auto - use the method most recently
        synced or default to fast if none synced. (default:
        auto)

    --pruning-history=[NUM]
        Set a minimum number of recent states to keep in memory
        when pruning is active. (default: 64)

    --pruning-memory=[MB]
        The ideal amount of memory in megabytes to use to store
        recent states. As many states as possible will be kept
        within this limit, and at least --pruning-history states
        will always be kept. (default: 32)

    --cache-size-db=[MB]
        Override database cache size. (default: 128)

    --cache-size-blocks=[MB]
        Specify the preferred size of the blockchain cache in
        megabytes. (default: 8)

    --cache-size-queue=[MB]
        Specify the maximum size of memory to use for block
        queue. (default: 40)

    --cache-size-state=[MB]
        Specify the maximum size of memory to use for the state
        cache. (default: 25)

    --db-compaction=[TYPE]
        Database compaction type. TYPE may be one of: ssd -
        suitable for SSDs and fast HDDs; hdd - suitable for slow
        HDDs; auto - determine automatically. (default: auto)

    --fat-db=[BOOL]
        Build appropriate information to allow enumeration of
        all accounts and storage keys. Doubles the size of the
        state database. BOOL may be one of on, off or auto.
        (default: auto)

    --cache-size=[MB]
        Set total amount of discretionary memory to use for the
        entire system, overrides other cache and queue options.

    --num-verifiers=[INT]
        Amount of verifier threads to use or to begin with, if
        verifier auto-scaling is enabled.

#### Import/export Options:
    --no-seal-check
        Skip block seal check.

#### Snapshot Options:
    --no-periodic-snapshot
        Disable automated snapshots which usually occur once
        every 10000 blocks.

    --snapshot-threads=[NUM]
        Enables multiple threads for snapshots creation.