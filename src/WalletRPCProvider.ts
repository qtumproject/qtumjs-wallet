import { IProvider } from "./Provider"
import axios, { CancelTokenSource } from "axios"
import { Insight } from "./Insight"
import { Wallet } from "./Wallet"

export class WalletRPCProvider implements IProvider {

  constructor(public wallet: Wallet) {}

  public rawCall(
    method: string,
    params: any[] = [],
    opts: any = {}): Promise<Insight.IContractCall | Insight.ISendRawTxResult> {
      const [contractAddress, encodedData, amount = 0, gasLimit = 200000, gasPrice = 0.0000004] = params
      opts = Object.assign({ amount, gasLimit, gasPrice }, opts)

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
