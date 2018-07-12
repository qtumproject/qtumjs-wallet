import { IProvider } from "./Provider"
import axios, { CancelTokenSource } from "axios"
import { Insight } from "./Insight"
import { Wallet } from "./Wallet"

export class WalletRPCProvider implements IProvider {

  constructor(public wallet: Wallet) {}

  public rawCall(
    method: string,
    params: any[],
    opts: any = {}): Promise<Insight.IContractCall | Insight.ISendRawTxResult> {
      const [contractAddress, encodedData, amount] = params
      opts = Object.assign({ amount }, opts)

      if (method === "sendToContract") {
        return this.wallet.contractSend(contractAddress, encodedData, opts)
      } else if (method === "callContract") {
        return this.wallet.contractCall(contractAddress, encodedData, opts)
      } else {
        throw new Error("Unknow method call")
      }
  }

  public cancelTokenSource(): CancelTokenSource {
    return axios.CancelToken.source()
  }

}

