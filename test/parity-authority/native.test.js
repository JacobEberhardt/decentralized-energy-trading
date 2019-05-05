const assert = require("assert");
const request = require("sync-request");
const util = require("util");

let title;

describe("Test Node Properties", function() {
  for (let i = 0; i < 2; i++) {
    title = util.format("Test Node #%d", i);
    describe(title, function() {
      const res = request("POST", "http://localhost:854" + i, {
        json: {
          jsonrpc: "2.0",
          method: "personal_listAccounts",
          params: [],
          id: 0
        }
      });
      const body = JSON.parse(res.getBody("utf8"));
      it("Return response code 200", function() {
        assert.strictEqual(res.statusCode, 200);
      });

      it("Node should have one account", function() {
        assert.strictEqual(body["result"].length, 1);
      });
    });
  }
});

describe.only("Test Network Properties", function() {
  for (let i = 0; i < 2; i++) {
    title = util.format("Test Node #%d", i);
    describe(title, () => {
      it("Node have one peer", async () => {
        const res = await request("POST", "http://localhost:854" + i, {
          json: {
            jsonrpc: "2.0",
            method: "net_peerCount",
            params: [],
            id: 0
          }
        });
        const body = JSON.parse(res.getBody("utf8"));
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(body["result"], "0x1");
      });

      it.skip("Block number is higher than 0", function() {
        const res = request("POST", "http://localhost:854" + i, {
          json: {
            jsonrpc: "2.0",
            method: "eth_blockNumber",
            params: [],
            id: 0
          }
        });
        const body = JSON.parse(res.getBody("utf8"));
        assert.strictEqual(res.statusCode, 200);
        assert.ok(body["result"] > 0);
      });
    });
  }
});
