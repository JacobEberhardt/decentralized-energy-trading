var assert = require("assert");
var request = require("sync-request");
var util = require("util");

const nodes = [process.env.NODE_0, process.env.NODE_1, process.env.NODE_2];

describe("Test Node Properties", function() {
  for (let i = 0; i < nodes.length; i++) {
    testTitle = util.format("Test Node #%d", i);
    describe(testTitle, function() {
      var res = request("POST", nodes[i], {
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

      it.skip("Node should have one account", function() {
        assert.equal(body["result"].length, 1);
      });
    });
  }
});

describe("Test Network Properties", function() {
  for (let i = 0; i < nodes.length; i++) {
    testTitle = util.format("Test Node #%d", i);
    describe(testTitle, function() {
      // delay in each retry after first failure
      beforeEach(function(done) {
        if (this.currentTest.currentRetry() > 0) {
          setTimeout(done, this.currentTest.currentRetry() * 500);
        } else {
          done();
        }
      });
      this.retries(10);

      it("Node have two peers", function() {
        var res = request("POST", nodes[i], {
          json: {
            jsonrpc: "2.0",
            method: "net_peerCount",
            params: [],
            id: 0,
          },
        });
        var body = JSON.parse(res.getBody("utf8"));
        assert.equal(res.statusCode, 200);
        assert.equal(body["result"], "0x2");
      });

      it("Block number is higher than 0", function() {
        var res = request("POST", nodes[i], {
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
