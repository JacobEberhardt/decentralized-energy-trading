var assert = require("assert");
var request = require("sync-request");
var util = require("util");

describe("Test Node Properties", function() {
  for (let i = 0; i < 2; i++) {
    title = util.format("Test Node #%d", i);
    describe(title, function() {
      var res = request("POST", "http://localhost:854" + i, {
        json: {
          jsonrpc: "2.0",
          method: "personal_listAccounts",
          params: [],
          id: 0,
        },
      });
      var body = JSON.parse(res.getBody("utf8"));
      it("Return response code 200", function() {
        assert.equal(res.statusCode, 200);
      });

      it("Node should have one account", function() {
        assert.equal(body["result"].length, 1);
      });
    });
  }
});

describe("Test Network Properties", function() {
  for (let i = 0; i < 2; i++) {
    title = util.format("Test Node #%d", i);
    describe(title, function() {
      this.retries(30);
      // it("Return response code 200", function() {
      //   assert.equal(res.statusCode, 200);
      // });

      it("Node have one peer", function() {
        var res = request("POST", "http://localhost:854" + i, {
          json: {
            jsonrpc: "2.0",
            method: "net_peerCount",
            params: [],
            id: 0,
          },
        });
        var body = JSON.parse(res.getBody("utf8"));
        assert.equal(res.statusCode, 200);
        assert.equal(body["result"], "0x1");
      });

      it.skip("Block number is higher than 0", function() {
        var res = request("POST", "http://localhost:854" + i, {
          json: {
            jsonrpc: "2.0",
            method: "eth_blockNumber",
            params: [],
            id: 0,
          },
        });
        var body = JSON.parse(res.getBody("utf8"));
        assert.equal(res.statusCode, 200);
        assert.ok(body["result"] > 0);
      });
    });
  }
});
