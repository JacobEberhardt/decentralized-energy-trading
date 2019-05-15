# Utility Contract(s)

Track energy production and consumption and distribute them fairly.

## Overview

Our contract is structured in the following way:

- `Mortal.sol` inherites from `openzeppelin-solidity/contracts/ownership/Ownable.sol` defining ownership of the utility contract and has the authority to permanently deactivate it.
- `UtilityBase.sol` implements the core logic of our utility `./interfaces/IUtilityBase.sol`.
- `Utility.sol` inherits from `./UtilityBase.sol` and implements settlement (netting) `./interfaces/IUtility.sol` to fairly distribute renewable energy.

## Test utility contracts

You can run the tests with `yarn test-contracts` without running a local Ethereum client.

## Common functions

The following is an outline of how we expect the flow of function calls looks like:

1. Households periodically provide information about energy production and consumption by using `updateRenewableEnergy` (and/or `updateNonRenewableEnergy`).
2. (WIP) Authority nodes periodically invoke regulation of the produce and consume imbalance such that most households are _happy_ (`settle`).
3. Energy transferred by the settlement is tracked and stored in `deeds`.
4. (WIP) Compensate negative amount of `renewableEnergy` by a simulated official utility organization calling (`updateNonRenewableEnergy`).

It is assumed that the utility contract is owned by a trusted party (perhaps a multisig wallet of trusted people). The owner has the authority to add new households using `addHousehold`.
