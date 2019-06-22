const request = require("request-promise");
const shell = require("shelljs");

const options = { resolveWithFullResponse: true };

async function callRPC(methodSignature, port, params = []) {
  const { statusCode, body } = await request(`http://localhost:${port}`, {
    method: "POST",
    json: {
      jsonrpc: "2.0",
      method: methodSignature,
      params: params,
      id: 0
    },
    ...options
  });

  return { statusCode, body };
}

export async function runMigrations(otherAccount) {
  shell.exec("./path_to_ur_file");
}

async function main() {
  console.log("Adding new peer ...");
  const enode = (await callRPC("parity_enode", 8556)).body.result;
  const isPeerAdded = (await callRPC("parity_addReservedPeer", 8555, [enode]))
    .body.result;
  console.log(`Peer added: ${isPeerAdded}`);

  console.log("Getting accounts ...");
  const adminAccount = (await callRPC("personal_listAccounts", 8555)).body
    .result[0];
  const otherAccount = (await callRPC("personal_listAccounts", 8556)).body
    .result[0];
  console.log(`Sending ether from ${adminAccount} to ${otherAccount} ...`);
  const params = [
    {
      from: adminAccount,
      to: otherAccount,
      value: "0xde0b6b3a7640000"
    },
    "node0"
  ];
  const transactionAddress = (await callRPC(
    "personal_sendTransaction",
    8555,
    params
  )).body;
  console.log(transactionAddress);
  console.log(`Running migration for ${otherAccount} ...`);
  shell.exec(`AUTHORITY_ADDRESS=${otherAccount} yarn migrate-contracts-docker`);
}

main();
