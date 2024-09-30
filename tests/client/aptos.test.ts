// import assert from "assert";
// import { Stream } from "../../src";
// import { Network } from "@aptos-labs/ts-sdk";

// describe("new stream object", () => {
//   it("load aptos client tests", async () => {
//     const stream = new Stream(Network.MAINNET);
//     const aptos = stream.getAptosClient();
//     const info = await aptos.getLedgerInfo();
//     assert(info.chain_id === 1, "chain id should be 1");
//     assert(
//       info.oldest_ledger_version === "0",
//       "oldest ledger version should be 0"
//     );
//     assert(
//       parseInt(info.ledger_version) > 1690050882,
//       "ledger version should be greater than 1690050882"
//     );
//     assert(
//       parseInt(info.oldest_block_height) == 0,
//       "oldest block height should be 0"
//     );
//     assert(
//       parseInt(info.block_height) > 224630080,
//       "block height should be greater than 224630080"
//     );
//   });

//   it("change aptos network", async () => {
//     const test_stream = new Stream(Network.TESTNET);
//     const test_info = await test_stream.getAptosClient().getLedgerInfo();
//     assert(test_info.chain_id === 2, "chain id should be 2");
//   });

//   it("use custom network", async () => {
//     const custom_stream = new Stream(
//       Network.CUSTOM,
//       "https://rpc.ankr.com/premium-http/aptos/e7e60392a39c22ec1644a9a9f9dd6f239705887a109e0bbe645925c1a03bdac1/v1"
//     );
//     const custom_info = await custom_stream.getAptosClient().getLedgerInfo();
//     assert(custom_info.chain_id === 1, "chain id should be 1");
//   });
// });
