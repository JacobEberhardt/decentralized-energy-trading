const chai = require("chai");
const request = require("request-promise");
const util = require("util");
const { assert } = chai;

const root = process.env.PROJECT_ROOT;
const web3Helper = require(`${root}/helpers/web3`);

const { OWNED_SET_ADDRESS } = require(`${root}/helpers/constants`);

const nodes = [process.env.NODE_0, process.env.NODE_1, process.env.NODE_2];
const options = { resolveWithFullResponse: true };

describe("Test Node Properties", () => {
  nodes.forEach((node, i) => {
    describe(util.format("Test Node #%d", i), () => {
      it("Node should have two accounts (authority + test account)", async () => {
        const { statusCode, body } = await request(nodes[i], {
          method: "POST",
          json: {
            jsonrpc: "2.0",
            method: "personal_listAccounts",
            params: [],
            id: 0
          },
          ...options
        });
        // NOTE: Including test account with a lot of ETH which is not a authority.
        assert.strictEqual(statusCode, 200);
        assert.strictEqual(body.result.length, 2);
      });
    });
  });
});

describe("Test Network Properties", () => {
  nodes.forEach((node, i) => {
    describe(util.format("Test Node #%d", i), function() {
      it("Node have two peers", async () => {
        const { statusCode, body } = await request(nodes[i], {
          ...options,
          method: "POST",
          json: {
            jsonrpc: "2.0",
            method: "net_peerCount",
            params: [],
            id: 0
          }
        });
        assert.strictEqual(statusCode, 200);
        assert.strictEqual(body.result, "0x2");
      });

      it("Block number is higher than 0", async () => {
        const { statusCode, body } = await request(nodes[i], {
          ...options,
          method: "POST",
          json: {
            jsonrpc: "2.0",
            method: "eth_blockNumber",
            params: [],
            id: 0
          }
        });
        assert.strictEqual(statusCode, 200);
        assert.ok(body.result > 0);
      });

      it("has 3 validators", async () => {
        const contractData = require(`${root}/build/contracts/OwnedSet.json`);
        const web3 = web3Helper.initWeb3("authority");
        const contract = new web3.eth.Contract(
          contractData.abi,
          OWNED_SET_ADDRESS
        );

        const validators = await contract.methods.getValidators().call();
        assert.strictEqual(validators, 3);
      });

      it("has 3 pending validators", async () => {
        const contractData = require(`${root}/build/contracts/OwnedSet.json`);
        const web3 = web3Helper.initWeb3("authority");
        const contract = new web3.eth.Contract(
          contractData.abi,
          OWNED_SET_ADDRESS
        );
        const pendingValidators = await contract.methods.getPending().call();
        assert.strictEqual(pendingValidators, 3);
      });
    });
  });
});
