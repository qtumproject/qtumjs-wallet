import * as qtum from "qtumjs-lib"
import * as bip39 from "bip39"

import { INetwork } from "./network"
import { Insight } from "./Insight"

export function generateMnemonic(): string {
  return bip39.generateMnemonic()
}

export function makeNewWallet(
  password: string,
  network: INetwork,
): { mnemonic: string, wallet: Wallet } {
  const mnemonic = bip39.generateMnemonic()
  const wallet = fromMnemonic(mnemonic, password, network)

  return {
    mnemonic,
    wallet,
  }
}

/**
 * Restore a HD-wallet address from mnemonic & password
 *
 * @param mnemonic
 * @param password
 * @param network
 */
export function fromMnemonic(
  mnemonic: string,
  password: string,
  network: INetwork,
) {
  // if (bip39.validateMnemonic(mnemonic) == false) return false
  const seedHex = bip39.mnemonicToSeedHex(mnemonic, password)
  const hdNode = qtum.HDNode.fromSeedHex(seedHex, network)
  const account = hdNode.deriveHardened(88).deriveHardened(0).deriveHardened(0)
  const keyPair = account.keyPair
  return new Wallet(keyPair, network)
}

/**
 * Restore 10 wallet addresses exported from QTUM's mobile clients. These
 * wallets are 10 sequential addresses rooted at the HD-wallet path
 * `m/88'/0'/0'` `m/88'/0'/1'` `m/88'/0'/2'`, and so on.
 *
 * @param mnemonic
 * @param network
 */
export function fromMobile(
  mnemonic: string,
  network: INetwork,
) {
  const seedHex = bip39.mnemonicToSeedHex(mnemonic)
  const hdNode = qtum.HDNode.fromSeedHex(seedHex, network)
  const account = hdNode.deriveHardened(88).deriveHardened(0)
  const wallets: Wallet[] = []
  for (let i = 0; i < 10; i++) {
    const hdnode = account.deriveHardened(i)
    const wallet = new Wallet(hdnode.keyPair, network)

    wallets.push(wallet)
  }
  return wallets
}

/**
 * Restore wallet from private key specified in WIF format:
 *
 * See: https://en.bitcoin.it/wiki/Wallet_import_format
 *
 * @param wif
 * @param network
 */
export function fromWIF(
  wif: string,
  network: INetwork,
) {
  const keyPair = qtum.ECPair.fromWIF(wif, network)
  return new Wallet(keyPair, network)
}

export class Wallet {
  public address: string
  private insight: Insight

  constructor(
    private keyPair: qtum.ECPair,
    public network: INetwork,
  ) {
    this.address = this.keyPair.getAddress()
    this.insight = Insight.forNetwork(this.network)
  }

  // public validateMnemonic(mnemonic, password) {
  //   const tempWallet = Wallet.restoreFromMnemonic(mnemonic, password)
  //   return this.keyPair.toWIF() === tempWallet.keyPair.toWIF()
  // }

  public getAddress(): string {
    return this.keyPair.getAddress()
  }

  public getPrivKey(): string {
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
