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
  OperateType,
  OperateUser,
  Stream,
  StreamEventType,
  StreamOperateParams,
  StreamType,
  aptos,
} from "../../src";
import { default_to_address, test_private_key } from "../config";
import assert from "assert";
import { exec } from "child_process";
import { FixedStrAddress } from "../../src/helper";
import { start } from "repl";

describe("stream operate test ", () => {
  const pair = new aptos.Ed25519PrivateKey(test_private_key);
  const account = aptos.Account.fromPrivateKey({
    privateKey: pair,
  });

  const stream = new Stream(account, Network.TESTNET);
  const client = stream.getAptosClient();
  it("pause one stream ", async () => {
    const sig = (await stream.pauseStream(
      new StreamOperateParams({
        stream_id:
          "0x297557e69964fd720177a5fad6f70ed1c9c6abe5a43710a68a68bedf2432a879",
        execute: true,
        is_fa: true,
      })
    )) as PendingTransactionResponse;
    console.log("pause transaction: ", sig.hash);
    await client.waitForTransaction({
      transactionHash: sig.hash,
      options: {
        checkSuccess: true,
      },
    });
  });
});
