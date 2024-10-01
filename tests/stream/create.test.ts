import {
  Account,
  AccountAddress,
  CommittedTransactionResponse,
  Network,
  PendingTransactionResponse,
  SimpleTransaction,
  TransactionResponse,
  UserTransactionResponse,
} from "@aptos-labs/ts-sdk";
import {
  CreateStreamParams,
  OperateUser,
  Stream,
  StreamEventType,
  StreamType,
  aptos,
} from "../../src";
import { default_to_address, test_private_key } from "../config";
import assert from "assert";
import { exec } from "child_process";

describe("create stream", () => {
  const pair = new aptos.Ed25519PrivateKey(test_private_key);
  const account = aptos.Account.fromPrivateKey({
    privateKey: pair,
  });
  const stream = new Stream(account, Network.TESTNET);
  const client = stream.getAptosClient();

  it("create one common stream", async () => {
    console.log("let's create one stream with APT");
    const now = Math.floor(Date.now() / 1000);
    const interval = 60;

    let options = new CreateStreamParams({
      execute: true,
      coin_type: "0x1::aptos_coin::AptosCoin",
      _remark: "nothing",
      name: "one test stream",
      is_fa: false,
      stream_type: StreamType.TypeStream,
      recipient: AccountAddress.from(default_to_address),
      deposit_amount: 10_000_000,
      cliff_amount: 1_000_000,
      cliff_time: now + 450,
      start_time: now + 300,
      stop_time: now + 300 + interval * 60 * 12,
      interval,
      auto_withdraw: false,
      auto_withdraw_interval: 600,
      pauseable: OperateUser.Both,
      closeable: OperateUser.Both,
      recipient_modifiable: OperateUser.Sender,
    });
    const sig = (await stream.createStream(options)) as TransactionResponse;
    console.log(sig.hash);

    await client.waitForTransaction({
      transactionHash: sig.hash,
      options: {
        checkSuccess: true,
      },
    });

    const execute_tx = (await client.getTransactionByHash({
      transactionHash: sig.hash,
    })) as UserTransactionResponse;

    assert(execute_tx.success, "transaction should be done");
    let stream_event = null;

    const stream_event_type = stream.getStreamEventName();

    for (let event of execute_tx.events) {
      if (event.type == stream_event_type) {
        stream_event = event;
        break;
      }
    }

    assert(stream_event != null, "should find the stream event");
    assert(
      stream_event.data.event_type == StreamEventType.CREATE,
      "should be create event "
    );
  });
});
