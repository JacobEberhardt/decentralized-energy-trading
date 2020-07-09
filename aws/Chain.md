# BC Network Setup

This is a small tutorial for setting up a network of multiple Parity nodes using PoA and transactions between them.

Central artifact:
- [Chain Specification](https://openethereum.github.io/wiki/Chain-specification.html)
- 


### Chain Specification

Important Links:
- [General Documentation](https://openethereum.github.io/wiki/Chain-specification.html)
- [Aurora Consensus Documentation](https://openethereum.github.io/wiki/Pluggable-Consensus.html)
- [Static Configs in DET project](https://github.com/JacobEberhardt/decentralized-energy-trading/blob/dynamic_dockerized_setup/parity-authority/parity/config/chain.json)
- [Dynmaic Configs in DET project](https://github.com/JacobEberhardt/decentralized-energy-trading/blob/dynamic_dockerized_setup/scripts/update-contract-bytecodes.js)


What does it do?

Configures a private network using a PoA consensus algorithm and setting up default accounts for ETH mainnet behaviour.

What default configurations are used in the project?

##### name
The name of the network.
```json
"name": "decentralized-energy-trading",
```

##### engine
The consensus algorithm used in the network.
```json
"authorityRound": {
    "params": {
    "stepDuration": 5,
    "blockReward": "0x38D7EA4C68000",
    "maximumUncleCountTransition": 0,
    "maximumUncleCount": 0,
    "validators": {
        "contract": "0x0000000000000000000000000000000000000044"
    }
    }
}
```

##### params
Additional entwork specific configuration paramters.
```json
"gasLimitBoundDivisor": "0x400",
"maximumExtraDataSize": "0x20",
"minGasLimit": "0x1388",
"networkID": "0x2323",
"eip140Transition": "0x0",
"eip211Transition": "0x0",
"eip214Transition": "0x0",
"eip658Transition": "0x0"
```

##### genesis
Configuration of the genesis block.
```json
"seal": {
    "authorityRound": {
    "step": "0x0",
    "signature": "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    }
},
"difficulty": "0x20000",
"gasLimit": "0x165A0BC00"
```

##### accounts
Predefined accounts.
| Address | Static/Dynamic | Describtion |
|---|--:|--:|
| 0000000000000000000000000000000000000005 | static | buildin contract: modexp |
| 0000000000000000000000000000000000000006 | static | buildin contract: alt_bn128_add |
| 0000000000000000000000000000000000000007 | static | buildin contract: alt_bn128_mul |
| 0000000000000000000000000000000000000008 | static | buildin contract: alt_bn128_pairing |
| 0x0000000000000000000000000000000000000001 | static | buildin contract: ecrecover |
| 0x0000000000000000000000000000000000000002 | static | buildin contract: sha256 |
| 0x0000000000000000000000000000000000000003 | static | buildin contract: ripemd160 |
| 0x0000000000000000000000000000000000000004 | static | buildin contract: identity |
| 0x00Bd138aBD70e2F00903268F3Db08f2D25677C9e | dynamic? | [AUTHORITY_ADDRESS](https://github.com/JacobEberhardt/decentralized-energy-trading/blob/master/helpers/constants.js) added in ?|
| 0x0000000000000000000000000000000000000042 | dynamic | [UTILITY_ADDRESS](https://github.com/JacobEberhardt/decentralized-energy-trading/blob/master/helpers/constants.js) added in [file](https://github.com/JacobEberhardt/decentralized-energy-trading/blob/dynamic_dockerized_setup/scripts/update-contract-bytecodes.js) with balance = 1 and constructor from file "dUtility.json" | 
| 0x0000000000000000000000000000000000000044 | dynamic | [OWNED_SET_ADDRESS](https://github.com/JacobEberhardt/decentralized-energy-trading/blob/master/helpers/constants.js) added in [file](https://github.com/JacobEberhardt/decentralized-energy-trading/blob/dynamic_dockerized_setup/scripts/update-contract-bytecodes.js) with balance = 1 and constructor from build file "OwnedSet.json" and constant [ENCODED_INITIAL_VALIDATOR_ADDRESSES](https://github.com/JacobEberhardt/decentralized-energy-trading/blob/dynamic_dockerized_setup/scripts/update-contract-bytecodes.js) |
| 0x0000000000000000000000000000000000000045 | dynamic | [VERIFIER_ADDRESS](https://github.com/JacobEberhardt/decentralized-energy-trading/blob/master/helpers/constants.js) added in [file](https://github.com/JacobEberhardt/decentralized-energy-trading/blob/dynamic_dockerized_setup/scripts/update-contract-bytecodes.js) with balance = 1 and constructor from file "Verifier.json" |
```

What dynamic configurations are used in the project?