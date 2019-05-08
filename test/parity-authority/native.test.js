const chai = require("chai");
const request = require("request-promise");
const util = require("util");

const { assert } = chai;

const nodes = [0, 1];

const options = { resolveWithFullResponse: true };

describe.only("Test Node Properties", () => {
  nodes.forEach(i => {
    describe(util.format("Test Node #%d", i), () => {
      it("Node should have one account", async () => {
        const { statusCode, body } = await request("http://localhost:854" + i, {
          method: "POST",
          json: {
            jsonrpc: "2.0",
            method: "personal_listAccounts",
            params: [],
            id: 0
          },
          ...options
        });
        assert.strictEqual(statusCode, 200);
        assert.strictEqual(body.result.length, 1);
      });
    });
  });
});

describe.only("Test Network Properties", () => {
  nodes.forEach(i => {
    describe(util.format("Test Node #%d", i), function() {
      // delay in each retry after first failure
      beforeEach(function(done) {
        if (this.currentTest.currentRetry() > 0) {
          setTimeout(done, this.currentTest.currentRetry() * 500);
        } else {
          done();
        }
      });
      this.retries(10);

      it("Node have one peer", async () => {
        const { statusCode, body } = await request("http://localhost:854" + i, {
          method: "POST",
          json: {
            jsonrpc: "2.0",
            method: "net_peerCount",
            params: [],
            id: 0
          },
          ...options
        });
        assert.strictEqual(statusCode, 200);
        assert.strictEqual(body.result, "0x1");
      });

      it.skip("Block number is higher than 0", async function() {
        const { statusCode, body } = await request("http://localhost:854" + i, {
          method: "POST",
          json: {
            jsonrpc: "2.0",
            method: "eth_blockNumber",
            params: [],
            id: 0
          },
          ...options
        });
        assert.strictEqual(statusCode, 200);
        assert.ok(body.result > 0);
      });
    });
  });
});
