import { IProvider } from "./Provider"
import axios, { CancelTokenSource } from "axios"
import { Insight } from "./Insight"
import { Wallet } from "./Wallet"

export class WalletRPCProvider implements IProvider {

  constructor(public wallet: Wallet) { }

  public rawCall(
    method: string,
    params: any[] = [],
    opts: any = {}): Promise<Insight.IContractCall | Insight.ISendRawTxResult> {
    const [
      contractAddress,
      encodedData,
      // these are optionals
      amount,
      gasLimit,
      gasPrice,
    ] = params

    // The underlying qtumjs-wallet API expects gasPrice and amount to be specified in sat
    const gasPriceInSatoshi = Math.floor((gasPrice || 0.0000004) * 1e8)
    const amountInSatoshi = Math.floor((amount || 0) * 1e8)

    opts = {
      ...opts,
      amount: amountInSatoshi,
      gasLimit: gasLimit || 200000,
      gasPrice: gasPriceInSatoshi,
    }

    switch (method.toLowerCase()) {
      case "sendtocontract":
        return this.wallet.contractSend(contractAddress, encodedData, opts)
      case "callcontract":
        return this.wallet.contractCall(contractAddress, encodedData, opts)
      default:
        throw new Error("Unknow method call")
    }
  }

  public cancelTokenSource(): CancelTokenSource {
    return axios.CancelToken.source()
  }

}
