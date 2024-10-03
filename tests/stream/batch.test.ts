import {
  AccountAddress,
  Network,
  PendingTransactionResponse,
  TransactionResponse,
  UserTransactionResponse,
} from "@aptos-labs/ts-sdk";
import {
  BatchCreateParams,
  CreateStreamParams,
  OperateUser,
  Stream,
  StreamEventType,
  StreamType,
  aptos,
} from "../../src";
import { default_to_address, test_private_key } from "../config";
import assert from "assert";

describe("create stream", async function () {
  const pair = new aptos.Ed25519PrivateKey(test_private_key);
  const account = aptos.Account.fromPrivateKey({
    privateKey: pair,
  });
  const stream = new Stream(account, Network.TESTNET);
  const client = stream.getAptosClient();
  it("let me create many streams", async () => {
    const now = Math.floor(Date.now() / 1000);
    const interval = 60;

    let test_batch_count = 10;

    let names = [];
    let recipients = [];
    let deposit_amounts = [];
    let cliff_amounts = [];

    for (let i = 0; i < test_batch_count; i++) {
      names.push(`stream_${i}`);
      recipients.push(
        AccountAddress.from(`0x` + i.toString().padStart(64, "0"))
      );
      deposit_amounts.push(10000);
      cliff_amounts.push(0);
    }

    const tx = (await stream.batchCreateSteam(
      new BatchCreateParams({
        execute: true,
        is_fa: false,
        coin_type: "0x1::aptos_coin::AptosCoin",
        _remark: "nothing",
        names,
        stream_type: StreamType.TypeStream,
        recipients,
        deposit_amounts,
        cliff_amounts,
        cliff_time: now + 450,
        start_time: now + 300,
        stop_time: now + 300 + interval * 60 * 12,
        interval,
        auto_withdraw: false,
        auto_withdraw_interval: 600,
        pauseable: OperateUser.Both,
        closeable: OperateUser.Both,
        recipient_modifiable: OperateUser.Sender,
      })
    )) as PendingTransactionResponse;

    await client.waitForTransaction({
      transactionHash: tx.hash,
      options: {
        checkSuccess: true,
      },
    });

    console.log("batch hash : ", tx.hash);
  });
});
