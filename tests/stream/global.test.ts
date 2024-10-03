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
import { FixedStrAddress } from "../../src/helper";

describe("global config load checking", () => {
  const pair = new aptos.Ed25519PrivateKey(test_private_key);
  const account = aptos.Account.fromPrivateKey({
    privateKey: pair,
  });
  const stream = new Stream(account, Network.TESTNET);
  it("load global config ", async () => {
    const g = await stream.getGlobalConfig();
    assert(
      g.streams_store.toString() ==
        "0x5ffb0d2d168f80790355fe1727910afc1e5f538a271269a21624e28741099dfc",
      "should get stream_store address"
    );
    assert(
      g.input_stream.toString() ==
        "0x90650bfa967e5258a689727082cb19bb496aafdebf5606ccdf97ba8cf4c62323",
      "should get input_stream address"
    );

    assert(
      FixedStrAddress(g.output_stream.toString()) ==
        "0x1c8a4f6b6a9770d1f65bdfd5ccdb809bcc257c300800af2063989bf3ad5b039",
      "should get output stream address"
    );
  });

  it("load stream list", async () => {
    const g = await stream.getGlobalConfig();
    const client = stream.getAptosClient();

    const items = await client.getTableItemsData({
      options: {
        where: {
          table_handle: {
            _eq: g.streams_store.toString(),
          },
        },
        limit: 10,
        offset: 0,
      },
    });

    assert(items.length == 10, "should get 10 streams data");
  });
});
