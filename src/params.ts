import { AccountAddress, AnyNumber } from "@aptos-labs/ts-sdk";
import { helper } from ".";

export interface CreateStreamOptions {
  execute: boolean;
  // this will contains with common coin
  coin_type?: string;
  // this only contains with fa_coin
  asset_type?: string;
  _remark: string;
  name: string;
  is_fa: boolean;
  stream_type: StreamType;
  recipient: AccountAddress;
  deposit_amount: AnyNumber;
  cliff_amount: AnyNumber;
  cliff_time: AnyNumber;
  start_time: AnyNumber;
  stop_time: AnyNumber;
  interval: AnyNumber;
  auto_withdraw: boolean;
  auto_withdraw_interval: AnyNumber;
  pauseable: OperateUser;
  closeable: OperateUser;
  recipient_modifiable: OperateUser;
}

export enum OperateUser {
  Sender,
  Recipient,
  Both,
}

export enum StreamType {
  TypeStream,
  TypePayment,
}

export class CreateStreamParams {
  private _options: CreateStreamOptions;
  constructor(options: CreateStreamOptions) {
    this._options = options;
  }

  getTypeArguments() {
    return this._options.is_fa ? [] : [this._options.coin_type as string];
  }

  getFunctionArguments() {
    if (this._options.is_fa) {
      return [
        this._options.name,
        helper.StreamTypeToString(this._options.stream_type),
        this._options.asset_type?.toString(),
        this._options.recipient,
        this._options.deposit_amount,
        this._options.cliff_amount,
        this._options.cliff_time,
        this._options.start_time,
        this._options.stop_time,
        this._options.interval,
        this._options.auto_withdraw,
        this._options.auto_withdraw_interval,
        helper.OperateUserToString(this._options.pauseable),
        helper.OperateUserToString(this._options.closeable),
        helper.OperateUserToString(this._options.recipient_modifiable),
      ];
    } else {
      return [
        this._options.name,
        this._options._remark,
        helper.StreamTypeToString(this._options.stream_type),
        this._options.recipient,
        this._options.deposit_amount,
        this._options.cliff_amount,
        this._options.cliff_time,
        this._options.start_time,
        this._options.stop_time,
        this._options.interval,
        this._options.auto_withdraw,
        this._options.auto_withdraw_interval,
        helper.OperateUserToString(this._options.pauseable),
        helper.OperateUserToString(this._options.closeable),
        helper.OperateUserToString(this._options.recipient_modifiable),
      ];
    }
  }

  isExecute() {
    return this._options.execute;
  }

  getMethod() {
    return this._options.is_fa ? "create_fa" : "create";
  }
}

export enum OperateType {
  Pause,
  Resume,
  Close,
  Extend,
  Claim,
}

export interface StreamOperateOptions {
  stream_id: string;
  // you should provide this param when operate common coin stream.
  coin_type?: string;
  execute?: boolean;
  operate_type?: OperateType;
  is_fa?: boolean;
  extend_time?: AnyNumber;
}

export class StreamOperateParams {
  private _options: StreamOperateOptions;
  constructor(options: StreamOperateOptions) {
    this._options = options;
  }

  isExecute() {
    return this._options.execute;
  }

  getTypeArguments() {
    switch (this._options.operate_type) {
      case OperateType.Pause:
        return this._options.is_fa ? [] : [this._options.coin_type];
      case OperateType.Resume:
        return [];
      case OperateType.Close:
        return this._options.is_fa ? [] : [this._options.coin_type];
      case OperateType.Extend:
        return this._options.is_fa ? [] : [this._options.coin_type];
      case OperateType.Claim:
        return this._options.is_fa ? [] : [this._options.coin_type];
    }
  }

  getFunctionArguments() {
    switch (this._options.operate_type) {
      case OperateType.Pause:
        return [this._options.stream_id];
      case OperateType.Resume:
        return [this._options.stream_id];
      case OperateType.Close:
        return [this._options.stream_id];
      case OperateType.Extend:
        return [this._options.extend_time, this._options.stream_id];
      case OperateType.Claim:
        return [this._options.stream_id];
    }
  }

  getMethod() {
    switch (this._options.operate_type) {
      case OperateType.Pause:
        return this._options.is_fa ? "pause_fa" : "pause";
      case OperateType.Resume:
        return this._options.is_fa ? "resume_fa" : "resume";
      case OperateType.Close:
        return this._options.is_fa ? "close_fa" : "close";
      case OperateType.Extend:
        return this._options.is_fa ? "extend_fa" : "extend";
      case OperateType.Claim:
        return this._options.is_fa ? "withdraw_fa" : "withdraw";
    }
  }

  setOperateType(t: OperateType) {
    this._options.operate_type = t;
  }
}
