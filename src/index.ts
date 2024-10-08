import dotenv from "dotenv";
import { Stream, aptos } from "@moveflow/aptos-sdk";

const main = async () => {
  dotenv.config();
  const operatorPrivateKey: string = process.env.PrivateKey as string;
  const pair = new aptos.Ed25519PrivateKey(operatorPrivateKey);
  const network = process.env.NETWORK as aptos.Network;
  let account = aptos.Account.fromPrivateKey({
    privateKey: pair,
  });

  const stream = new Stream(account, network);
  console.log("current sender : ", stream.getSenderAddress().toString());
  console.log("current network : ", network);

  const client = stream.getAptosClient();
  const info = await client.getLedgerInfo();
  console.log("try get chain info ");
  console.table(info);
};

main();
