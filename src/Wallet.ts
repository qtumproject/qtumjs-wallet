import * as bip39 from "bip39"

import { ECPair } from "bitcoinjs-lib"

import { INetworkInfo } from "./Network"
import { Insight } from "./Insight"
import { buildSendToContractTransaction, buildPubKeyHashTransaction, IUTXO } from "./tx"

const defaultTxOptions = {
  gasLimit: 250000,
  gasPrice: 40, // 40 satoshi
  // gasPrice: 0.0000004,
  fee: 0,
  amount: 0,

  // Wallet uses only one address. Can't really support senderAddress.
  // senderAddress
}

export interface ITXOptions {
  amount?: number
  gasLimit?: number
  gasPrice?: number
  fee?: number
}

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

  public async generateTx(to: string, amount: number, fee: number): Promise<string> {
    const utxos = await this.getBitcoinjsUTXOs()
    return buildPubKeyHashTransaction(this.keyPair, to, amount, fee, utxos)
  }

  public async send(to: string, amount: number, fee: number): Promise<Insight.ISendRawTxResult> {
    const rawtx = await this.generateTx(to, amount, fee)
    return this.sendRawTx(rawtx)
  }

  public async sendRawTx(rawtx: string): Promise<Insight.ISendRawTxResult> {
    return this.insight.sendRawTx(rawtx)
  }

  public async generateContractSendTx(
    contractAddress: string,
    encodedData: string,
    opts: ITXOptions = {}) {

    const utxos = await this.getBitcoinjsUTXOs()

    return buildSendToContractTransaction(
      this.keyPair,
      contractAddress,
      encodedData,
      opts.amount || defaultTxOptions.amount,
      opts.gasLimit || defaultTxOptions.gasLimit,
      opts.gasPrice || defaultTxOptions.gasPrice,
      opts.fee || defaultTxOptions.fee,
      utxos,
    )
  }

  public async contractCall(address: string, encodedData: string) {
    return this.insight.contractCall(address, encodedData)
  }

  /**
   * Massage UTXOs returned by the Insight API to UTXO format accepted by the
   * underlying qtumjs-lib.
   */
  private async getBitcoinjsUTXOs(): Promise<IUTXO[]> {
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

  // contractCreate

  // TODO
  // generateCreateContractTx
  // qrc20 lookup
}
