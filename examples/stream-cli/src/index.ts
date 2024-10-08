import dotenv from "dotenv";
import { Stream, aptos } from "@moveflow/aptos-sdk";

const main = async () => {
  dotenv.config();
  const operatorPrivateKey: string = process.env.PrivateKey as string;
  const pair = new aptos.Ed25519PrivateKey(operatorPrivateKey);
  console.log(pair);
  let account = aptos.Account.fromPrivateKey({
    privateKey: pair,
  });
  console.log(account.publicKey);
  const stream = new Stream(account, process.env.NETWORK as aptos.Network);
  console.log(stream.getSenderAddress());
};

main();
