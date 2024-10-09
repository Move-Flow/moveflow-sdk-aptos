import {
  AccountAddress,
  Network,
  UserTransactionResponse,
} from "@aptos-labs/ts-sdk";
import { OperateUser, StreamType } from "./params";
import { ContractAddress } from "./config";
import { helper } from ".";

export enum StreamInterval {
  BySecond = 1,
  ByMinute = 60,
  ByHour = 3600,
  ByDay = 86400,
  ByWeek = 86400 * 7,
  By2Week2 = 86400 * 14,
  ByMonth = 86400 * 30,
  ByQuater = 86400 * 90,
  ByYear = 86400 * 360,
}

const StreamTypeToString = (stream_type: StreamType) => {
  switch (stream_type) {
    case StreamType.TypePayment:
      return "payment";
    case StreamType.TypeStream:
      return "stream";
  }
};

const OperateUserToString = (u: OperateUser) => {
  switch (u) {
    case OperateUser.Sender:
      return "sender";
    case OperateUser.Both:
      return "both";
    case OperateUser.Recipient:
      return "recipient";
  }
};

const FixedAddress = (address: AccountAddress) => {
  let s = address.toString();
  return FixedStrAddress(s);
};

const FixedStrAddress = (s: string) => {
  if (s.startsWith("0x0")) {
    return "0x" + s.substring(3);
  } else {
    return s;
  }
};

const unixSeconds = () => {
  return Math.floor(new Date().getTime() / 1000);
};

const parseStreamEventFromTransaction = (
  transaction: UserTransactionResponse,
  pkg_address: AccountAddress
) => {
  const events = transaction.events;
  const streamEvents = events.filter(
    (event) =>
      event.type === `${helper.FixedAddress(pkg_address)}::stream::StreamEvent`
  );
  return streamEvents;
};

export {
  StreamTypeToString,
  OperateUserToString,
  FixedAddress,
  FixedStrAddress,
  unixSeconds,
  parseStreamEventFromTransaction,
};
