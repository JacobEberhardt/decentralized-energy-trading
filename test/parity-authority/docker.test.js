const chai = require("chai");
const request = require("request-promise");
const util = require("util");

const { assert } = chai;

const nodes = [process.env.NODE_0, process.env.NODE_1, process.env.NODE_2];
const options = { resolveWithFullResponse: true };

describe("Test Node Properties", () => {
  nodes.forEach((node, i) => {
    describe(util.format("Test Node #%d", i), () => {
      let response;

      before(async () => {
        response = await request(nodes[i], {
          ...options,
          method: "POST",
          json: {
            jsonrpc: "2.0",
            method: "personal_listAccounts",
            params: [],
            id: 0
          }
        });
      });

      it("Return response code 200", () => {
        assert.strictEqual(response.statusCode, 200);
      });

      it("Node should have two accounts (authority + test account)", () => {
        // NOTE: Including test account with a lot of ETH which is not a authority.
        assert.strictEqual(response.body.result.length, 2);
      });
    });
  });
});

describe("Test Network Properties", () => {
  nodes.forEach((node, i) => {
    describe(util.format("Test Node #%d", i), function() {
      beforeEach(function(done) {
        if (this.currentTest.currentRetry() > 0) {
          setTimeout(done, this.currentTest.currentRetry() * 500);
        } else {
          done();
        }
      });
      this.retries(10);

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
    });
  });
});
