import * as qtum from "qtumjs-lib"
import * as bip39 from "bip39"

import { INetworkInfo } from "./Network"
import { Insight } from "./Insight"

export class Wallet {
  public address: string
  private insight: Insight

  constructor(
    private keyPair: qtum.ECPair,
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
    const uxtos = await this.getUTXOs()
    // FIXME: Generating another raw tx before the previous tx had be mined
    // could cause overlapping UXTOs to be used.

    // FIXME: make the two compatible...
    // massage UXTO to format accepted by bitcoinjs
    const bitcoinjsUXTOs = uxtos.map((uxto) => ({
      ...uxto,
      pos: uxto.vout,
      value: uxto.satoshis,
      hash: uxto.txid,
    }))

    return qtum.utils.buildPubKeyHashTransaction(this.keyPair, to, amount, fee, bitcoinjsUXTOs)
  }

  public async send(to: string, amount: number, fee: number): Promise<Insight.ISendRawTxResult> {
    const rawtx = await this.generateTx(to, amount, fee)
    return this.sendRawTx(rawtx)
  }

  public async sendRawTx(rawtx: string): Promise<Insight.ISendRawTxResult> {
    return this.insight.sendRawTx(rawtx)
  }

  // TODO
  // generateCreateContractTx
  // generateSendToContractTx
  // callContract
  // qrc20 lookup
}
