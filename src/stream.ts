import {
  Account,
  AccountAddress,
  AnyNumber,
  Aptos,
  AptosConfig,
  Network,
  PaginationArgs,
  SimpleTransaction,
} from "@aptos-labs/ts-sdk";
import {
  BatchCreateParams,
  BatchWithdrawParams,
  CreateStreamParams,
  OperateType,
  StreamDirection,
  StreamOperateParams,
} from "./params";
import { ContractAddress, GlobalConfig } from "./config";

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

export interface PreparedTransaction {
  isExecute(): boolean;
  getMethod(): string;
  getTypeArguments(): string[];
  getFunctionArguments(): any[];
}

export class Stream {
  private _network: Network;
  private _url?: string;
  private _sender: AccountAddress | Account;
  private _global?: GlobalConfig;

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
    return this.operateStream(options as PreparedTransaction);
  }

  public async batchCreateSteam(options: BatchCreateParams) {
    return this.operateStream(options as PreparedTransaction);
  }

  public async withdrawStream(options: StreamOperateParams) {
    options.setOperateType(OperateType.Claim);
    return this.operateStream(options as PreparedTransaction);
  }

  public async batchWithdrawStream(options: BatchWithdrawParams) {
    return this.operateStream(options as PreparedTransaction);
  }

  public async extendStream(options: StreamOperateParams) {
    options.setOperateType(OperateType.Extend);
    return this.operateStream(options as PreparedTransaction);
  }

  public async closeStream(options: StreamOperateParams) {
    options.setOperateType(OperateType.Close);
    return this.operateStream(options as PreparedTransaction);
  }
  public async pauseStream(options: StreamOperateParams) {
    options.setOperateType(OperateType.Pause);
    return this.operateStream(options as PreparedTransaction);
  }

  public async resumeStream(options: StreamOperateParams) {
    options.setOperateType(OperateType.Resume);
    return this.operateStream(options as PreparedTransaction);
  }

  private async operateStream(options: PreparedTransaction) {
    const aptos = this.getAptosClient();
    let tx: SimpleTransaction = await aptos.transaction.build.simple({
      sender: this.getSenderAddress(),
      data: {
        function: this.getEntryFunction(
          "stream",
          options.getMethod() as string
        ) as any,
        typeArguments: options.getTypeArguments() as any,
        functionArguments: options.getFunctionArguments() as any,
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

  public async getGlobalConfig() {
    if (!this._global) {
      const client = this.getAptosClient();
      const global = await client.getAccountResource({
        accountAddress: this.getContractAddress(),
        resourceType: `${this.getContractAddress()}::stream::GlobalConfig`,
      });
      this._global = new GlobalConfig(global);
    }
    return this._global;
  }

  public async getRegisteredCoinConfigs() {
    const g = await this.getGlobalConfig();
    const client = this.getAptosClient();
    return await client.getTableItemsData({
      options: {
        where: {
          table_handle: {
            _eq: g.coin_configs.toString(),
          },
        },
      },
    });
  }

  public async fetchStream(stream_id: string) {
    const g = await this.getGlobalConfig();
    const client = this.getAptosClient();
    const contract = this.getContractAddress();
    return await client.getTableItem({
      handle: g.streams_store.toString(),
      data: {
        key_type: "address",
        value_type: `${contract}::stream::StreamInfo`,
        key: stream_id,
      },
    });
  }

  /**
   * This function is still under development. Use with caution.
   * @deprecated
   */
  public async getStreams(direction: StreamDirection, pages: PaginationArgs) {
    let w: any = {};
    if (direction == StreamDirection.Incoming) {
      w.recipient = this.getSenderAddress();
    } else if (direction == StreamDirection.Outgoing) {
      w.sender = this.getSenderAddress();
    } else {
    }

    const g = await this.getGlobalConfig();
    const client = this.getAptosClient();
    return await client.getTableItemsData({
      options: {
        where: {
          table_handle: {
            _eq: g.streams_store.toString(),
          },
          decoded_value: {
            _contains: w,
          },
        },
        orderBy: [
          {
            transaction_version: "desc",
          },
        ],
        ...pages,
      },
    });
  }
}
