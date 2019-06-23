const fs = require("fs");
const path = require("path");

const chainSpec = require("../parity-authority/docker/parity/config/chain.json");
const utilityArtefact = require("../build/contracts/Utility.json");
const blockRewardArtefact = require("../build/contracts/BlockReward.json");
const validatorSetArtefact = require("../build/contracts/OwnedSet.json");

const UTILITY_ADDRESS = "0x0000000000000000000000000000000000000042";
const BLOCK_REWARD_ADDRESS = "0x0000000000000000000000000000000000000043";
const VALIDATOR_SET_ADDRESS = "0x0000000000000000000000000000000000000044";
// TODO: Dynamically generate with web3
const ENCODED_INITIAL_VALIDATOR_ADDRESSES =
  "0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000bd138abd70e2f00903268f3db08f2d25677c9e";

if (!utilityArtefact) {
  throw new Error("No contract artefact for Utility found.");
}

if (!blockRewardArtefact) {
  throw new Error("No contract artefact for BlockReward found.");
}

if (!validatorSetArtefact) {
  throw new Error("No contract artefact for ValidatorSet found.");
}

fs.writeFile(
  path.resolve("./parity-authority/docker/parity/config/chain.json"),
  JSON.stringify(
    {
      ...chainSpec,
      accounts: {
        ...chainSpec.accounts,
        [UTILITY_ADDRESS]: {
          balance: "1",
          constructor: utilityArtefact.bytecode
        },
        [BLOCK_REWARD_ADDRESS]: {
          balance: "1",
          constructor: blockRewardArtefact.bytecode
        },
        [VALIDATOR_SET_ADDRESS]: {
          balance: "1",
          constructor:
            validatorSetArtefact.bytecode + ENCODED_INITIAL_VALIDATOR_ADDRESSES
        }
      }
    },
    null,
    2
  ),
  err => {
    if (err) {
      throw err;
    }
    console.log("Contract bytecodes updated.");
  }
);
