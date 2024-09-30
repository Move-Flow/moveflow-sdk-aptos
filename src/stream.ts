import {
  Account,
  AccountAddress,
  Aptos,
  AptosConfig,
  Network,
  SimpleTransaction,
} from "@aptos-labs/ts-sdk";
import { Address } from "cluster";

export const ContractAddress = {
  Mainnet: "0x15a5484b9f8369dd3d60c43e4530e7c1bb82eef041bf4cf8a2090399bebde5d4",
  Testnet: "0x04836e267e5290dd8c4e21a0afa83e7c5f589005f58cc6fae76407b90f5383da",
};

export interface CreateStreamOptions {
  name: string;
  description: string;
  amount: number;
  duration: number;
  is_fa: boolean;
}

export class CreateStreamParams {
  private _options: CreateStreamOptions;
  constructor(options: CreateStreamOptions) {
    this._options = options;
  }

  getTypeArguments() {
    return [];
  }

  getFunctionArguments() {
    return [];
  }
}

export type StreamConfig = {};

export class Stream {
  private _network: Network;
  private _url?: string;
  private _sender: AccountAddress;

  constructor(sender: AccountAddress, network: Network, url?: string) {
    this._network = network;
    this._url = url;
    this._sender = sender;
  }

  public getAccountAddress() {
    if (this._network === Network.MAINNET) {
      return ContractAddress.Mainnet;
    }
    return ContractAddress.Testnet;
  }

  private getEntryFunction(module: string, name: string) {
    return `${this.getAccountAddress()}::${module}::${name}`;
  }

  public async createStream(options: CreateStreamParams) {
    const aptos = this.getAptosClient();
    let tx: SimpleTransaction = await aptos.transaction.build.simple({
      sender: this._sender,
      data: {
        function: this.getEntryFunction("stream", "") as any,
        typeArguments: options.getTypeArguments(),
        functionArguments: options.getFunctionArguments(),
      },
    });
    return tx;
  }

  public getAptosClient() {
    const config = new AptosConfig({
      network: this._network,
      fullnode: this._url,
    });
    return new Aptos(config);
  }
}
