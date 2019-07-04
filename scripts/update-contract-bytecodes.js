const fs = require("fs");
const path = require("path");

const chainSpec = require("../parity-authority/parity/config/chain.json");
const utilityArtefact = require("../build/contracts/Utility.json");
const dUtilityArtefact = require("../build/contracts/dUtility.json");
const blockRewardArtefact = require("../build/contracts/BlockReward.json");
const validatorSetArtefact = require("../build/contracts/OwnedSet.json");
const verifierArtefact = require("../build/contracts/Verifier.json");

const {
  UTILITY_ADDRESS,
  BLOCK_REWARD_ADDRESS,
  OWNED_SET_ADDRESS,
  VERIFIER_ADDRESS
} = require("../helpers/constants");

// TODO: Dynamically generate with web3
const ENCODED_INITIAL_VALIDATOR_ADDRESSES =
  "0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000bd138abd70e2f00903268f3db08f2d25677c9e";

if (!utilityArtefact) {
  throw new Error("No contract artefact for Utility found.");
}

if (!dUtilityArtefact) {
  throw new Error("No contract artefact for dUtility found.");
}

if (!blockRewardArtefact) {
  throw new Error("No contract artefact for BlockReward found.");
}

if (!validatorSetArtefact) {
  throw new Error("No contract artefact for ValidatorSet found.");
}

if (!verifierArtefact) {
  throw new Error("No contract artefact for Verifier found.");
}

fs.writeFile(
  path.resolve("./parity-authority/parity/config/chain.json"),
  JSON.stringify(
    {
      ...chainSpec,
      accounts: {
        ...chainSpec.accounts,
        [UTILITY_ADDRESS]: {
          balance: "1",
          constructor: dUtilityArtefact.bytecode
        },
        [BLOCK_REWARD_ADDRESS]: {
          balance: "1",
          constructor: blockRewardArtefact.bytecode
        },
        [OWNED_SET_ADDRESS]: {
          balance: "1",
          constructor:
            validatorSetArtefact.bytecode + ENCODED_INITIAL_VALIDATOR_ADDRESSES
        },
        [VERIFIER_ADDRESS]: {
          balance: "1",
          constructor: verifierArtefact.bytecode
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
