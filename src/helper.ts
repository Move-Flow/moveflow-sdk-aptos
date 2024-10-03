import { AccountAddress } from "@aptos-labs/ts-sdk";
import { OperateType, OperateUser, StreamType } from "./params";

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

export {
  StreamTypeToString,
  OperateUserToString,
  FixedAddress,
  FixedStrAddress,
};
