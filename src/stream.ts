import {
  Account,
  AccountAddress,
  AnyNumber,
  Aptos,
  AptosConfig,
  Network,
  SimpleTransaction,
} from "@aptos-labs/ts-sdk";
import { CreateStreamParams, OperateType, StreamOperateParams } from "./params";

export enum StreamEventType {
  CREATE = 100,
  WITHDRAW = 101,
  CLOSE = 102,
  EXTEND = 103,
  REGISTER_COIN = 104,
  SET_FEE_POINT = 105,
  SET_FEE_TO = 106,
  SET_NEW_ADMIN = 107,
  SET_NEW_RECIPIENT = 108,
  PAUSE = 109,
  RESUME = 110,
  SET_AUTO_WITHDRAW_ACCOUNT = 111,
  SET_AUTO_WITHDRAW_FEE = 112,
}

export const ContractAddress = {
  Mainnet: "0x15a5484b9f8369dd3d60c43e4530e7c1bb82eef041bf4cf8a2090399bebde5d4",
  Testnet: "0x04836e267e5290dd8c4e21a0afa83e7c5f589005f58cc6fae76407b90f5383da",
};

export type StreamConfig = {};

export class Stream {
  private _network: Network;
  private _url?: string;
  private _sender: AccountAddress | Account;

  constructor(
    sender: AccountAddress | Account,
    network: Network,
    url?: string
  ) {
    this._network = network;
    this._url = url;
    this._sender = sender;
  }

  public isSenderSigner() {
    return (this._sender as Account).accountAddress !== undefined;
  }

  public getStreamEventName() {
    let contract = this.getContractAddress();
    if (contract.startsWith("0x0")) {
      contract = "0x" + contract.substring(3);
    }
    return `${contract}::stream::StreamEvent`;
  }

  public getContractAddress() {
    if (this._network === Network.MAINNET) {
      return ContractAddress.Mainnet;
    }
    return ContractAddress.Testnet;
  }

  private getEntryFunction(module: string, name: string) {
    return `${this.getContractAddress()}::${module}::${name}`;
  }

  public getSenderAddress() {
    if (this.isSenderSigner()) {
      return (this._sender as Account).accountAddress;
    } else {
      return this._sender as AccountAddress;
    }
  }

  public async createStream(options: CreateStreamParams) {
    const aptos = this.getAptosClient();
    let tx: SimpleTransaction = await aptos.transaction.build.simple({
      sender: this.getSenderAddress(),
      data: {
        function: this.getEntryFunction("stream", options.getMethod()) as any,
        typeArguments: options.getTypeArguments(),
        functionArguments: options.getFunctionArguments(),
      },
    });
    if (options.isExecute()) {
      return await aptos.signAndSubmitTransaction({
        signer: this._sender as Account,
        transaction: tx,
      });
    } else {
      return tx;
    }
  }

  public async batchCreateSteam() {}

  public async extendStream() {}
  public async closeStream() {}
  public async withdrawStream() {}
  public async batchWithdrawStream() {}

  public async pauseStream(options: StreamOperateParams) {
    options.setOperateType(OperateType.Pause);
    return this.operateStream(options);
  }

  public async resumeStream(options: StreamOperateParams) {
    options.setOperateType(OperateType.Resume);
    return this.operateStream(options);
  }

  public async operateStream(options: StreamOperateParams) {
    const aptos = this.getAptosClient();
    let tx: SimpleTransaction = await aptos.transaction.build.simple({
      sender: this.getSenderAddress(),
      data: {
        function: this.getEntryFunction("stream", "") as any,
        typeArguments: options.getTypeArguments(),
        functionArguments: options.getFunctionArguments(),
      },
    });

    if (options.isExecute()) {
      return await aptos.signAndSubmitTransaction({
        signer: this._sender as Account,
        transaction: tx,
      });
    } else {
      return tx;
    }
  }

  public async transfer(to: AccountAddress, amount: AnyNumber) {
    const aptos = this.getAptosClient();
    const tx = await aptos.transferCoinTransaction({
      sender: this.getSenderAddress(),
      recipient: to,
      amount,
    });
    if (this.isSenderSigner()) {
      return await aptos.signAndSubmitTransaction({
        signer: this._sender as Account,
        transaction: tx,
      });
    } else {
      return tx;
    }
  }

  public getAptosClient() {
    const config = new AptosConfig({
      network: this._network,
      fullnode: this._url,
    });
    return new Aptos(config);
  }
}
