import { NetworkNames, INetworkInfo } from "./Network"

import axios, { AxiosInstance } from "axios"

const INSIGHT_BASEURLS: { [key: string]: string } = {
  [NetworkNames.MAINNET]: "https://explorer.qtum.org/insight-api",
  [NetworkNames.TESTNET]: "https://testnet.qtum.org/insight-api",
}

export class Insight {
  // public static mainnet(): Insight {
  //   return new Insight(MAINNET_API_BASEURL)
  // }

  // public static testnet(): Insight {
  //   return new Insight(TESTNET_API_BASEURL)
  // }

  public static forNetwork(network: INetworkInfo): Insight {
    const baseURL = INSIGHT_BASEURLS[network.name]
    if (baseURL == null) {
      throw new Error(`No Insight API defined for network: ${network.name}`)
    }

    return new Insight(baseURL)
  }

  private axios: AxiosInstance

  constructor(private baseURL: string) {
    this.axios = axios.create({
      baseURL,
      // don't throw on non-200 response
      // validateStatus: () => true,
    })
  }

  public async listUTXOs(address: string): Promise<Insight.IUTXO[]> {
    const res = await this.axios.get(`/addr/${address}/utxo`)
    return res.data
  }

  public async getInfo(address: string): Promise<Insight.IGetInfo> {
    const res = await this.axios.get(`/addr/${address}/utxo`)
    return res.data
  }

  public async sendRawTx(rawtx: string): Promise<Insight.ISendRawTxResult> {
    const res = await this.axios.post("/tx/send", {
      rawtx,
    })

    return res.data
  }
}

export namespace Insight {
  export type Foo = string

  export interface ISendRawTxResult {
    txid: string
  }

  export interface IUTXO {
    address: string
    txid: string
    vout: number

    /**
     * Public key that controls this UXTO, as hex string.
     */
    scriptPubKey: string

    amount: number
    satoshis: number

    isStake: boolean
    height: number
    confirmations: number
  }

  export interface IGetInfo {
    addStr: string

    /**
     * balance of address in qtum
     */
    balance: number

    /**
     * Balance of address in satoshi
     */
    balanceSat: number

    totalReceived: number
    totalReceivedSat: number
    totalSet: number
    totalSentSat: number

    unconfirmedBalance: number
    unconfirmedBalanceSat: number

    unconfirmedTxApperances: number
    txApperances: number

    /**
     * List of transaction IDs
     */
    transactions: string[]
  }
}
