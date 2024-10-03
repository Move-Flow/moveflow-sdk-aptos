import { Network, PendingTransactionResponse } from "@aptos-labs/ts-sdk";
import { Stream, StreamOperateParams, aptos, helper } from "../../src";
import { test_private_key } from "../config";
import assert from "assert";

describe("stream operate test ", () => {
  const pair = new aptos.Ed25519PrivateKey(test_private_key);
  const account = aptos.Account.fromPrivateKey({
    privateKey: pair,
  });

  const stream = new Stream(account, Network.TESTNET);
  const client = stream.getAptosClient();

  it("claim one stream ", async () => {
    const stream_id =
      "0x8c3d8cb2e1fdc2e5db4988522b76ae5a99a910d432935d10b0fceda19e42adef";

    const sig = (await stream.withdrawStream(
      new StreamOperateParams({
        stream_id:
          "0x8c3d8cb2e1fdc2e5db4988522b76ae5a99a910d432935d10b0fceda19e42adef",
        execute: true,
        coin_type: "0x1::aptos_coin::AptosCoin",
      })
    )) as PendingTransactionResponse;
    console.log("withdraw transaction: ", sig.hash);

    await client.waitForTransaction({
      transactionHash: sig.hash,
      options: {
        checkSuccess: true,
      },
    });
  });
});
