import {
  AccountAddress,
  Network,
  PendingTransactionResponse,
  SimpleTransaction,
} from "@aptos-labs/ts-sdk";
import { Stream, aptos } from "../../src";
import { default_to_address, test_private_key } from "../config";
import assert from "assert";

describe("aptos table getter test", () => {
  const pair = new aptos.Ed25519PrivateKey(test_private_key);
  const account = aptos.Account.fromPrivateKey({
    privateKey: pair,
  });
  const stream = new Stream(account, Network.TESTNET);
  const client = stream.getAptosClient();

  it("get table items", async () => {
    const g = await stream.getGlobalConfig();
    console.log(g.streams_store.toString());
    const streams = await client.getTableItemsData({
      options: {
        where: {
          table_handle: {
            _eq: g.streams_store.toString(),
          },
          decoded_value: {
            _contains: {
              create_at: "1727958289",
            },
          },
          transaction_version: {
            _gt: "1191474197",
          },
        },
        orderBy: [
          {
            transaction_version: "desc",
          },
        ],
        limit: 10,
      },
    });
    console.log(JSON.stringify(streams));
  });
});
