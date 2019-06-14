const request = require("request-promise");
const shell = require("shelljs");

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

async function run_migrations(other_account) {
  shell.exec("./path_to_ur_file");
}

async function main() {
  console.log("Adding new peer ...");
  const enode = (await callRPC("parity_enode", 8556)).body.result;
  const isPeerAdded = (await callRPC("parity_addReservedPeer", 8555, [enode])).body.result;
  console.log(`Peer added: ${isPeerAdded}`);

  console.log("Getting accounts ...");
  const admin_account = (await callRPC("personal_listAccounts", 8555)).body.result[0];
  const other_account = (await callRPC("personal_listAccounts", 8556)).body.result[0];
  console.log(`Sending ether from ${admin_account} to ${other_account} ...`);
  const params = [
    {
      from: admin_account,
      to: other_account,
      value: "0xde0b6b3a7640000",
    },
    "node0",
  ];
  const transactionAddress = (await callRPC("personal_sendTransaction", 8555, params)).body;
  console.log(transactionAddress);
  console.log(`Running migration for ${other_account} ...`);
  shell.exec(`AUTHORITY_ADDRESS=${other_account} yarn migrate-contracts-docker`);
}

main();
