# moveflow-sdk-aptos

## Introduction

**Move-Flow** is an crypto asset streaming protocol built in Move language on both [Aptos](https://aptosfoundation.org/) and [Sui](https://sui.io/) blockchains.

Move-Flow is able to transfer assets on chain according to predefined rules. With one transaction, funds will flow from your wallet to the recipient real-time(by second), to conduct timely financial transactions without intermediaries..

This is the Typescript SDK for the protocol.

You can find [docs here](https://github.com/Move-Flow/moveflow-sdk-aptos)

## Install sdk

```shell
pnpm install @moveflow/aptos-sdk
```

## Usage Example

### Init SDK

Init Stream Object with Ed25516 Private key, this kind of stream object can execute transaction directly.

```typescript
import { Stream, aptos } from "@moveflow/aptos-sdk";
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

### Batch Create streams(payment)

```typescript
const now = Math.floor(Date.now() / 1000);
const interval = 60;

let test_batch_count = 10;

let names = [];
let recipients = [];
let deposit_amounts = [];
let cliff_amounts = [];

for (let i = 0; i < test_batch_count; i++) {
  names.push(`stream_${i}`);
  recipients.push(AccountAddress.from(`0x` + i.toString().padStart(64, "0")));
  deposit_amounts.push(10000);
  cliff_amounts.push(0);
}

const tx = (await stream.batchCreateSteam(
  new BatchCreateParams({
    execute: true,
    is_fa: true,
    asset_type:
      "0x355efcd852a0757eb4289f25b4627f368e72bae178d719ad6f7b435c7f201e59",
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
```

You can build as many as 200 streams in one transaction.
One import tips you should know: You must set enough gas with one transaction.

### Pause one stream

```typescript
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
```

### Resume one stream

```typescript
const sig = (await stream.resumeStream(
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
```

### Close one stream

```typescript
const sig = (await stream.closeStream(
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
```

### Extend one stream

```typescript
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
```

### fetch one stream info

```typescript
const stream_id =
  "0x8c3d8cb2e1fdc2e5db4988522b76ae5a99a910d432935d10b0fceda19e42adef";

const stream_info = await stream.fetchStream(stream_id);
console.log(stream_info);
```

### withdraw stream

```typescript
const sig = (await stream.withdrawStream(
  new StreamOperateParams({
    stream_id:
      "0x8c3d8cb2e1fdc2e5db4988522b76ae5a99a910d432935d10b0fceda19e42adef",
    execute: true,
    coin_type: "0x1::aptos_coin::AptosCoin",
  })
)) as PendingTransactionResponse;
console.log("withdraw transaction: ", sig.hash);

await client.waitForTransaction({
  transactionHash: sig.hash,
  options: {
    checkSuccess: true,
  },
});
```

### Batch withdraw streams

```typescript
const tx = (await stream.batchWithdrawStream(
  new BatchWithdrawParams({
    is_fa: false,
    stream_ids: [
      "0xf1f5f103580f56393b5a259279c0648ef4756a5eff901ba7b66b2b94a9676f94",
    ],
    coin_type: "0x1::aptos_coin::AptosCoin",
    execute: true,
  })
)) as PendingTransactionResponse;

await client.waitForTransaction({
  transactionHash: tx.hash,
  options: {
    checkSuccess: true,
  },
});

console.log("batch withdraw tx : ", tx.hash);
```
