# Utility Contract(s)

Track energy production/consumption and distribute them fairly.

## Overview

Our contract is structured in the following way:

- `Owned.sol` and `Mortal.sol`: defines ownership of the utility contract and has the authority to permanently deactivate it.
- `Utility.sol`: the core logic of our utility that households want to talk to. Implements `IUtility.sol`.

## Common functions

The following is an outline of how we expect the flow of function calls looks like:

1. households periodically provide information about energy production and consumption by using `updateRenewableEnergy` and/or `updateNonRenewableEnergy`.
2. (WIP) authority nodes periodically invoke regulation of the produce/consume imbalance such that most households are *happy* (`settle`).
3. (WIP) households that produced energy can receive their reward by checking if they have successfully distributed energy. The reward comes in the form of an event, e.g, `TransferEnergy`. An alternative approach to this is emitting `TransferEnergy` immediately inside `settle` for each transfer.

It is assumed that the utility contract is owned by a trusted party (perhaps a multisig wallet of trusted people). The owner has the authority to add new households using `addHousehold`.
