import {
  AccountAddress,
  CommittedTransactionResponse,
  Network,
  UserTransactionResponse,
} from "@aptos-labs/ts-sdk";
import { Stream, aptos, helper } from "../../src";
import { test_private_key } from "../config";
import assert from "assert";

describe("parse stream event from transaction", () => {
  const pair = new aptos.Ed25519PrivateKey(test_private_key);
  // console.log(pair);
  const account = aptos.Account.fromPrivateKey({
    privateKey: pair,
  });
  console.log("test account address: ", account.accountAddress.toString());
  const stream = new Stream(account.accountAddress, Network.TESTNET);
  const client = stream.getAptosClient();

  it("parse stream event from transaction", async () => {
    const pkg_address = stream.getContractAddress();
    console.log("stream contract address: ", pkg_address.toString());

    const tx = (await client.getTransactionByHash({
      transactionHash:
        "0x2587195830d79f9d77124bcf2e5672ab0cdae7f64e1d016378765848af9bc9e6",
    })) as CommittedTransactionResponse;
    // console.log("tx: ", tx);

    const events = helper.parseStreamEventFromTransaction(
      tx as UserTransactionResponse,
      AccountAddress.fromString(pkg_address)
    );
    console.log("events: ", events);
  });
});
