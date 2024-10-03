import { AccountAddress } from "@aptos-labs/ts-sdk";

export const ContractAddress = {
  Mainnet: "0x15a5484b9f8369dd3d60c43e4530e7c1bb82eef041bf4cf8a2090399bebde5d4",
  Testnet: "0x04836e267e5290dd8c4e21a0afa83e7c5f589005f58cc6fae76407b90f5383da",
};

export class GlobalConfig {
  public admin: AccountAddress;
  public streams_store: AccountAddress;
  public input_stream: AccountAddress;
  public output_stream: AccountAddress;

  constructor(resource: any) {
    this.admin = AccountAddress.from(resource.admin);
    this.streams_store = AccountAddress.from(
      resource.streams_store.inner.handle
    );
    this.input_stream = AccountAddress.from(resource.input_stream.handle);
    this.output_stream = AccountAddress.from(resource.output_stream.handle);
  }
}
