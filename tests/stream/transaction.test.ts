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

describe("stream result checking", () => {
  const pair = new aptos.Ed25519PrivateKey(test_private_key);
  const account = aptos.Account.fromPrivateKey({
    privateKey: pair,
  });
  const stream = new Stream(account, Network.TESTNET);
  const client = stream.getAptosClient();

  it("parse one transaction with stream create", async () => {
    const execute_tx = (await client.getTransactionByHash({
      transactionHash:
        "0x3c2f873f60741dccab5064809f11b4c7f8677992b4071573d4e6ae79e8f20053",
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
