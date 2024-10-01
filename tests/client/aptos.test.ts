import {
  AccountAddress,
  Network,
  PendingTransactionResponse,
  SimpleTransaction,
} from "@aptos-labs/ts-sdk";
import { Stream, aptos } from "../../src";
import { default_to_address, test_private_key } from "../config";
import assert from "assert";

describe("new stream object", () => {
  const pair = new aptos.Ed25519PrivateKey(test_private_key);
  const account = aptos.Account.fromPrivateKey({
    privateKey: pair,
  });
  console.log("test account address: ", account.accountAddress.toString());

  it("generate account", () => {
    const pair = aptos.Account.generate();
    console.log("new private key : ", pair.privateKey.toString());
    const account = aptos.Account.fromPrivateKey({
      privateKey: pair.privateKey,
    });
    console.log("new address : ", account.accountAddress.toString());
  });

  it("load aptos client tests", async () => {
    console.log("mainnet client test ...");
    const stream = new Stream(account.accountAddress, Network.MAINNET);
    const aptos = stream.getAptosClient();
    const info = await aptos.getLedgerInfo();
    assert(info.chain_id === 1, "chain id should be 1");
    assert(
      info.oldest_ledger_version === "0",
      "oldest ledger version should be 0"
    );
    assert(
      parseInt(info.ledger_version) > 1690050882,
      "ledger version should be greater than 1690050882"
    );
    assert(
      parseInt(info.oldest_block_height) == 0,
      "oldest block height should be 0"
    );
    assert(
      parseInt(info.block_height) > 224630080,
      "block height should be greater than 224630080"
    );

    console.log("testnet client test ...");

    const test_stream = new Stream(account.accountAddress, Network.TESTNET);
    const test_aptos = test_stream.getAptosClient();
    const test_info = await test_aptos.getLedgerInfo();
    assert(test_info.chain_id === 2, "test chain id should be 1");
  });

  it("use custom network rpc", async () => {
    const custom_stream = new Stream(
      account.accountAddress,
      Network.CUSTOM,
      "https://rpc.ankr.com/premium-http/aptos/e7e60392a39c22ec1644a9a9f9dd6f239705887a109e0bbe645925c1a03bdac1/v1"
    );
    const custom_info = await custom_stream.getAptosClient().getLedgerInfo();
    assert(custom_info.chain_id === 1, "chain id should be 1");
  });

  it("get current test account balance", async () => {
    const test_stream = new Stream(account.accountAddress, Network.TESTNET);
    const aptos = test_stream.getAptosClient();
    const balance = await aptos.getAccountAPTAmount({
      accountAddress: account.accountAddress,
    });
    assert(balance > 0, "testnet balance must big than 0 ");
  });

  it("pass signer to stream", async () => {
    const test_stream = new Stream(account, Network.TESTNET);
    assert(test_stream.isSenderSigner(), "isSendSigner must return true");
    const address = test_stream.getSenderAddress();
    assert(
      address.toString() == account.accountAddress.toString(),
      "address should returned."
    );
  });

  it("transfer use signer", async () => {
    const test_stream = new Stream(account, Network.TESTNET);
    const aptos = test_stream.getAptosClient();

    const checkingAddress = AccountAddress.from(default_to_address);

    const beforeBalance = await aptos.getAccountAPTAmount({
      accountAddress: checkingAddress,
    });

    const transfer_amount = 1000;

    const tx = (await test_stream.transfer(
      AccountAddress.from(default_to_address),
      transfer_amount
    )) as PendingTransactionResponse;

    await aptos.waitForTransaction({
      transactionHash: tx.hash,
      options: { checkSuccess: true },
    });

    const postBalance = await aptos.getAccountAPTAmount({
      accountAddress: checkingAddress,
    });

    assert(
      postBalance - beforeBalance - transfer_amount == 0,
      "transfer action should be done"
    );
  });

  it("transfer use address", async () => {
    const test_stream = new Stream(account.accountAddress, Network.TESTNET);
    const aptos = test_stream.getAptosClient();

    const checkingAddress = AccountAddress.from(default_to_address);

    const beforeBalance = await aptos.getAccountAPTAmount({
      accountAddress: checkingAddress,
    });

    const transfer_amount = 1000;

    const tx = (await test_stream.transfer(
      AccountAddress.from(default_to_address),
      transfer_amount
    )) as SimpleTransaction;

    const sign = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction: tx,
    });

    await aptos.waitForTransaction({
      transactionHash: sign.hash,
      options: { checkSuccess: true },
    });

    const postBalance = await aptos.getAccountAPTAmount({
      accountAddress: checkingAddress,
    });

    assert(
      postBalance - beforeBalance - transfer_amount == 0,
      "transfer action should be done"
    );
  });
});
