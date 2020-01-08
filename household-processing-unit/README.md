# Household Processing Unit

The HHS Processing Unit encapsule the following components in a docker ubuntu image:

- Household Server
- Household UI
- Parity Node

## Images

1. The first one is called `hhpu_admin`. Its parity account is already been predefined and is the owner of both `dUtility` and `BaseOwnedSet` contracts. It also has a lot of ether, to share with new participants.
2. The second one `hhpu` is a regular image that after been setup needs to be connected to the network. A new address is generated every time a new instance is generated.

## Setup

To test this setup of two households (one admin and one regular) execute the following commands (in the root directory of the project!):

1. Start both households:

```sh
docker-compose up
```

2. After both nodes are up and running connect them and add the address of the second node to the `dUtility` and `BaseOwnedSet` contract using the following command:

```sh
yarn connect-docker-nodes
```

You can access the UI of the different nodes in following addresses:

- Admin Household: [htt://localhost:3010](htt://localhost:3010)
- Additional Household: [htt://localhost:3011](htt://localhost:3011)

You can find the additional exposed ports by looking into the `docker-compose.yml` file or by executing `docker ps` in a terminal.
