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

export { StreamTypeToString, OperateUserToString };
