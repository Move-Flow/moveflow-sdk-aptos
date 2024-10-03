import { Network, PendingTransactionResponse } from "@aptos-labs/ts-sdk";
import { OperateType, Stream, StreamOperateParams, aptos } from "../../src";
import { test_private_key } from "../config";

describe("stream operate test ", () => {
  const pair = new aptos.Ed25519PrivateKey(test_private_key);
  const account = aptos.Account.fromPrivateKey({
    privateKey: pair,
  });

  const stream = new Stream(account, Network.TESTNET);
  const client = stream.getAptosClient();
  it("close one stream ", async () => {
    const sig = (await stream.closeStream(
      new StreamOperateParams({
        stream_id:
          "0x297557e69964fd720177a5fad6f70ed1c9c6abe5a43710a68a68bedf2432a879",
        execute: true,
        operate_type: OperateType.Close,
        is_fa: true,
      })
    )) as PendingTransactionResponse;
    console.log("close transaction: ", sig.hash);
    await client.waitForTransaction({
      transactionHash: sig.hash,
      options: {
        checkSuccess: true,
      },
    });
  });
});
