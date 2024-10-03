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

  it("extend one stream ", async () => {
    const stream_id =
      "0x8c3d8cb2e1fdc2e5db4988522b76ae5a99a910d432935d10b0fceda19e42adef";

    const stream_info = (await stream.fetchStream(stream_id)) as any;
    console.log("current stop_time : ", stream_info.stop_time);
    console.log("current interval : ", stream_info.interval);
    const new_extend_time =
      Number(stream_info.stop_time) + Number(stream_info.interval) * 120;
    console.log("new stop_time : ", new_extend_time);

    const sig = (await stream.extendStream(
      new StreamOperateParams({
        stream_id:
          "0x8c3d8cb2e1fdc2e5db4988522b76ae5a99a910d432935d10b0fceda19e42adef",
        execute: true,
        extend_time: new_extend_time,
        coin_type: "0x1::aptos_coin::AptosCoin",
      })
    )) as PendingTransactionResponse;
    console.log("extend transaction: ", sig.hash);

    await client.waitForTransaction({
      transactionHash: sig.hash,
      options: {
        checkSuccess: true,
      },
    });
  });
});
