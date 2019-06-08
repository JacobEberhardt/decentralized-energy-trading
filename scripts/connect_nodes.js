const request = require("request-promise");

const options = { resolveWithFullResponse: true };

async function callRPC(method_signature, port, params = []) {
  const { statusCode, body } = await request(`http://localhost:${port}`, {
    method: "POST",
    json: {
      jsonrpc: "2.0",
      method: method_signature,
      params: params,
      id: 0,
    },
    ...options,
  });

  return { statusCode, body };
}

async function main() {
  console.log("Adding new peer ...");
  var { statusCode, body } = await callRPC("parity_enode", 8556);
  const enode = body.result;
  var { statusCode, body } = await callRPC("parity_addReservedPeer", 8555, [enode]);
  console.log(`Peer added: ${body.result}`);

  console.log("Getting accounts ...");
  var { statusCode, body } = await callRPC("personal_listAccounts", 8555);
  admin_account = body.result.pop();
  var { statusCode, body } = await callRPC("personal_listAccounts", 8556);
  other_account = body.result.pop();
  console.log(`Sending ether from ${admin_account} to ${other_account} ...`);
  params = [
    {
      from: admin_account,
      to: other_account,
      value: "0xde0b6b3a7640000",
    },
    "node0",
  ];
  var { statusCode, body } = await callRPC("personal_sendTransaction", 8555, params);
  console.log(body);
}

main();
