import * as bip39 from "bip39"

import { ECPair } from "bitcoinjs-lib"

import { INetworkInfo } from "./Network"
import { Insight } from "./Insight"
import {
  buildSendToContractTransaction,
  buildPubKeyHashTransaction,
  IUTXO,
  IContractSendTXOptions,
  ISendTxOptions,
} from "./tx"

/**
 * The default relay fee rate (per byte) if network doesn't cannot estimate how much to use.
 *
 * This value will be used for testnet.
 */
const defaultTxFeePerByte = Math.ceil(400000 / 1024)

export class Wallet {
  public address: string
  private insight: Insight

  constructor(
    private keyPair: ECPair,
    public network: INetworkInfo,
  ) {
    this.address = this.keyPair.getAddress()
    this.insight = Insight.forNetwork(this.network)
  }

  // public validateMnemonic(mnemonic, password) {
  //   const tempWallet = Wallet.restoreFromMnemonic(mnemonic, password)
  //   return this.keyPair.toWIF() === tempWallet.keyPair.toWIF()
  // }

  public toWIF(): string {
    return this.keyPair.toWIF()
  }

  public async getInfo() {
    return this.insight.getInfo(this.address)
  }

  public async getUTXOs() {
    return this.insight.listUTXOs(this.address)
  }

  /**
   * The network relay fee rate. (satoshi per byte)
   */
  public async feeRatePerByte(): Promise<number> {
    const feeRate = await this.insight.estimateFeePerByte()
    if (feeRate === -1) {
      return defaultTxFeePerByte
    }
    return feeRate
  }

  /**
   * Generate a payment transaction
   *
   * @param to The receiving address
   * @param amount The amount to transfer (in satoshi)
   * @param opts
   */
  public async generateTx(to: string, amount: number, opts: ISendTxOptions = {}): Promise<string> {
    const utxos = await this.getBitcoinjsUTXOs()

    const feeRate = Math.ceil(opts.feeRate || await this.feeRatePerByte())

    return buildPubKeyHashTransaction(
      utxos,
      this.keyPair,
      to,
      amount,
      feeRate,
    )
  }

  /**
   * Send payment to a receiving address
   *
   * @param to The receiving address
   * @param amount The amount to transfer (in satoshi)
   * @param opts
   */
  public async send(to: string, amount: number, opts: ISendTxOptions = {}): Promise<Insight.ISendRawTxResult> {
    const rawtx = await this.generateTx(to, amount, opts)
    return this.sendRawTx(rawtx)
  }

  /**
   * Submit a signed raw transaction to the network.
   *
   * @param rawtx Hex encoded raw transaction data.
   */
  public async sendRawTx(rawtx: string): Promise<Insight.ISendRawTxResult> {
    return this.insight.sendRawTx(rawtx)
  }

  /**
   * Generate a raw send-to-contract transaction that calls a smart contract.
   *
   * @param contractAddress
   * @param encodedData
   * @param opts
   */
  public async generateContractSendTx(
    contractAddress: string,
    encodedData: string,
    opts: IContractSendTXOptions = {}) {

    const utxos = await this.getBitcoinjsUTXOs()

    const feeRate = Math.ceil(opts.feeRate || await this.feeRatePerByte())

    // TODO: estimate the precise gasLimit

    return buildSendToContractTransaction(
      utxos,
      this.keyPair,
      contractAddress,
      encodedData,
      feeRate,
      opts,
    )
  }

  public async contractCall(
    contractAddress: string,
    encodedData: string,
    opts: IContractSendTXOptions = {},
  ) {
    return this.insight.contractCall(contractAddress, encodedData)
  }

  public async contractSend(
    contractAddress: string,
    encodedData: string,
    opts: IContractSendTXOptions = {},
  ): Promise<Insight.ISendRawTxResult> {
    const rawTx = await this.generateContractSendTx(contractAddress, encodedData, opts)
    return this.sendRawTx(rawTx)
  }

  /**
   * Massage UTXOs returned by the Insight API to UTXO format accepted by the
   * underlying qtumjs-lib.
   */
  public async getBitcoinjsUTXOs(): Promise<IUTXO[]> {
    const uxtos = await this.getUTXOs()
    // FIXME: Generating another raw tx before the previous tx had be mined
    // could cause overlapping UXTOs to be used.

    // FIXME: make the two compatible...
    // massage UXTO to format accepted by bitcoinjs
    const bitcoinjsUTXOs: IUTXO[] = uxtos.map((uxto) => ({
      ...uxto,
      pos: uxto.vout,
      value: uxto.satoshis,
      hash: uxto.txid,
    }))

    return bitcoinjsUTXOs
  }

  // generateCreateContractTx
  // contractCreate

  // TODO
  // qrc20 lookup
  // estimateCall
}
