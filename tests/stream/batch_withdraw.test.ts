import { Network, PendingTransactionResponse } from "@aptos-labs/ts-sdk";
import { BatchWithdrawParams, Stream, aptos } from "../../src";
import { test_private_key } from "../config";

describe("batch withdraw stream", async function () {
  const pair = new aptos.Ed25519PrivateKey(test_private_key);
  const account = aptos.Account.fromPrivateKey({
    privateKey: pair,
  });
  const stream = new Stream(account, Network.TESTNET);
  const client = stream.getAptosClient();
  it("let me create many streams", async () => {
    const tx = (await stream.batchWithdrawStream(
      new BatchWithdrawParams({
        is_fa: false,
        stream_ids: [
          "0xf1f5f103580f56393b5a259279c0648ef4756a5eff901ba7b66b2b94a9676f94",
        ],
        coin_type: "0x1::aptos_coin::AptosCoin",
        execute: true,
      })
    )) as PendingTransactionResponse;

    await client.waitForTransaction({
      transactionHash: tx.hash,
      options: {
        checkSuccess: true,
      },
    });

    console.log("batch withdraw tx : ", tx.hash);
  });
});
