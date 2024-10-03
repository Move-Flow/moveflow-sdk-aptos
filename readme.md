# moveflow-sdk-aptos

## Introduction

**Move-Flow** is an crypto asset streaming protocol built in Move language on both [Aptos](https://aptosfoundation.org/) and [Sui](https://sui.io/) blockchains.

Move-Flow is able to transfer assets on chain according to predefined rules. With one transaction, funds will flow from your wallet to the recipient real-time(by second), to conduct timely financial transactions without intermediaries..

This is the Typescript SDK for the protocol

You can find [docs here](https://github.com/Move-Flow/moveflow-sdk-aptos)

## Install sdk

```shell
pnpm install @moveflow/aptos-sdk
```

## Usage Example

### Init SDK

Init Stream Object with Ed25516 Private key, this kind of stream object can execute transaction directly.

```typescript
const pair = new aptos.Ed25519PrivateKey(test_private_key);
const account = aptos.Account.fromPrivateKey({
  privateKey: pair,
});
const stream = new Stream(account, Network.TESTNET);
```

Init Stream Object with simple address, this kind of stream object can only return the prepared transaction.

```typescript
const stream = new Stream(sender_address, Network.TESTNET);
```

### Create a new payment(stream) stream

```typescript
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
```

If you create based common coin , you should pass with params:

**is_fa:false** and **coin_type:"0x1::aptos_coin::AptosCoin"**

And if you want to build with fa-coin should pass : **is_fa:true** and **asset_type:"0x355efcd852a0757eb4289f25b4627f368e72bae178d719ad6f7b435c7f201e59"**.

Param **stream_type** can be used split payment stream or stream stream.
