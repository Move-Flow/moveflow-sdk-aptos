import dotenv from "dotenv";
import { BatchCreateParams, OperateUser, Stream, StreamType, aptos, helper } from "@moveflow/aptos-sdk";
import { getLogger } from "./util";
import { Command } from "commander"; // Add this import
import { readFileSync, appendFileSync } from "fs";
import { AccountAddress, PendingTransactionResponse } from "@aptos-labs/ts-sdk";
import { StreamInterval } from "../dist/src/helper";

dotenv.config();

const program = new Command(); // Initialize commander

const main = async (options: {
  network: string;
  token: string;
  privateKey: string;
  file: string;
  batch: number;
  log: string;
}) => {
  const logger = getLogger(options.log);
  const operatorPrivateKey: string =
    options.privateKey || (process.env.PrivateKey as string);
  const pair = new aptos.Ed25519PrivateKey(operatorPrivateKey);
  const network = (options.network || process.env.NETWORK) as aptos.Network;
  const airdropToken = (options.token || process.env.AirdropToken) as string;
  const is_fa = airdropToken.indexOf("::") === -1;
  let account = aptos.Account.fromPrivateKey({
    privateKey: pair,
  });
  const stream = new Stream(account, network);

  const csv = readFileSync(options.file, "utf8");
  const lines = csv.split("\n");
  const airdropList = lines.map((line) => {
    const [address, amount] = line.split(",");
    return { address, amount: parseInt(amount) };
  });

  logger.info("current sender : %s", stream.getSenderAddress().toString());
  logger.info("current network : %s", network);

  const client = stream.getAptosClient();
  const info = await client.getLedgerInfo();
  logger.info("try get chain info %s", JSON.stringify(info));
  logger.info("airdrop token  : %s", airdropToken);
  logger.info("is_fa : %s", is_fa);
  logger.info("airdrop list : %d", airdropList.length);

  const sender_info = await client.getAccountInfo({
    accountAddress: stream.getSenderAddress()
  })
  logger.info(sender_info);


  const batchSize = options.batch;
  for (let i = 0; i < airdropList.length; i += batchSize) {
    const batch = airdropList.slice(i, i + batchSize);
    logger.info("processing batch %d with size %d", i, batch.length);

    const start_time = helper.unixSeconds() + 300
    const interval = StreamInterval.ByDay * 180;

    const batchCreateParams = new BatchCreateParams({
      execute: true,
      is_fa: is_fa,
      names: batch.map((item) => item.address),
      _remark:"",
      stream_type: StreamType.TypeStream,
      recipients:batch.map(item=>AccountAddress.from(item.address)),
      deposit_amounts:batch.map(item=>item.amount),
      cliff_amounts: batch.map(_item=>0),
      cliff_time: 0,
      start_time,
      interval,
      stop_time: start_time + interval * 2, 
      auto_withdraw: true,
      auto_withdraw_interval: StreamInterval.ByMonth,
      pauseable:OperateUser.Both,
      closeable:OperateUser.Both,
      recipient_modifiable:OperateUser.Sender,
      coin_type: airdropToken,
      asset_type: airdropToken,
    })

    let sum = 0;
    batch.map(item=>sum+=item.amount);
    console.log(`need amount : `,sum);

    const tx = await stream.batchCreateSteam(batchCreateParams) as PendingTransactionResponse;
    await client.waitForTransaction({
      transactionHash: tx.hash,
      options:{
        checkSuccess:true
      }
    })

    logger.info("aidrop done with account from %d  to %d ",i,i+batchSize);
    break;

  }
};

// Define a default command with options
program
  .command("airdrop")
  .option("-p, --privateKey <privateKey>", "Specify the private key")
  .option("-n, --network <network>", "Specify the network")
  .option("-t, --token <token>", "Specify the airdrop token")
  .requiredOption("-f, --file <file>", "Specify the csv file to read")
  .option("-b, --batch <batch>", "Specify the batch size", "50")
  .option("-l, --log <log>", "Specify the transaction log file", "batch.log")
  .action(async (options) => {
    console.log("Executing default command with options... : ",options);
    await main(options);
  });

program
  .command("generate-csv")
  .option(
    "--number <number>",
    "Specify the number of accounts to generate",
    "1000"
  )
  .action((options: { number: string }) => {
    const logger = getLogger();
    logger.info("Generating CSV... with number %s", options.number);

    for (let i = 0; i < parseInt(options.number); i++) {
      let account = aptos.Account.generate();
      logger.info("Generated account: %s", account.accountAddress.toString());
      let amount = Math.floor(Math.random() * 1000) * 1_000;
      logger.info("Generated amount: %s", amount);
      logger.info(
        "Generated line: %s",
        `${account.accountAddress.toString()},${amount}`
      );

      appendFileSync(
        "airdrop.csv",
        `${account.accountAddress.toString()},${amount}\n`
      );
    }
  });

program.parse(process.argv); // Parse command-line arguments

program.on("close", () => {
  const logger = getLogger();
  logger.flush();
});
