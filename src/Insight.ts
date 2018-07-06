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
    const res = await this.axios.get(`/addr/${address}`)
    return res.data
  }

  public async sendRawTx(rawtx: string): Promise<Insight.ISendRawTxResult> {
    const res = await this.axios.post("/tx/send", {
      rawtx,
    })

    return res.data
  }

  public async contractCall(address: string, encodedData: string): Promise<Insight.IContractCall> {
    // FIXME wow, what a weird API design... maybe we should just host the RPC
    // server, with limited API exposed.
    const res = await this.axios.get(`/contracts/${address}/hash/${encodedData}/call`)

    return res.data
  }

  /**
   * Estimate the fee per KB of txdata, in satoshi. Returns -1 if no estimate is
   * available. It always return -1 for testnet.
   *
   * @param nblocks
   */
  public async estimateFee(nblocks: number = 6): Promise<any> {
    const res = await this.axios.get(`/utils/estimatefee?nbBlocks=${nblocks}`)

    const feeRate: number = res.data
    if (typeof feeRate !== "number" || feeRate < 0) {
      return -1
    }

    return Math.ceil(feeRate * 1e8)
  }

  /**
   * Estimate the fee per byte of txdata, in satoshi. Returns -1 if no estimate is
   * available. It always return -1 for testnet.
   *
   * @param nblocks
   */
  public async estimateFeePerByte(nblocks: number = 6): Promise<any> {
    const feeRate = await this.estimateFee()

    if (feeRate < 0) {
      return feeRate
    }

    return Math.ceil(feeRate / 1024)
  }

  public async getTransactionInfo(id: string): Promise<Insight.ITransactionInfo> {
    const res = await this.axios.get(`/tx/${id}`)
    const rawInfo = res.data as Insight.IRawTransactionInfo
    const { txid, confirmations, time, vin: [{ vout, addr }, ...rest], vout: [{ value }, ...other] } = rawInfo

    return {
      txid,
      confirmations,
      time: new Date(time * 1000),
      type: vout === 0 ? "in" : "out",
      address: addr,
      amount: value,
    }
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

  export interface IExecutionResult {
    gasUsed: number
    excepted: string
    newAddress: string
    output: string
    codeDeposit: number
    gasRefunded: number
    depositSize: number
    gasForDeposit: number
  }

  export interface ITransactionReceipt {
    stateRoot: string
    gasUsed: number
    bloom: string
    log: any[]
  }

  export interface IContractCall {
    address: string
    executionResult: any
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

  export interface IVin {
    txid: string,
    vout: number, // 0: 转入；1: 转出
    addr: string // 执行转出的钱包地址
  }

  export interface IVout {
    value: string
  }

  export interface IRawTransactionInfo {
    txid: string,
    vin: IVin[], // [交易, ...]
    vout: IVout[], // [交易, 余额]
    confirmations: number,
    time: number,
    valueOut: number, // 扣除手续费的余额（发送方）
    valueIn: number, // 交易前余额（发送方）
    fees: number // 手续费
  }

  export interface ITransactionInfo {
    txid: string,
    type: "in" | "out",
    address: string,
    amount: string,
    confirmations: number,
    time: Date
  }
}
