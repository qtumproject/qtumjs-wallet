import { HDNode, ECPair } from "bitcoinjs-lib"
import * as bip38 from "bip38"
import * as bip39 from "bip39"
import * as wifEncoder from "wif"
import * as bs58 from "bs58check"

import { Wallet } from "./Wallet"
import { Insight } from "./Insight"
import { validatePrivateKey } from "./index"
import { IScryptParams, params } from "./scrypt"
import { NetworkNames } from "./constants"
export { NetworkNames } from "./constants"

export interface INetworkInfo {
  name: string

  messagePrefix: string
  bech32: string

  // HDWallet https://en.bitcoin.it/wiki/BIP_0032
  bip32: {
    public: number
    private: number
  }

  pubKeyHash: number
  scriptHash: number
  wif: number
}

export const networksInfo: { [key: string]: INetworkInfo } = {
  [NetworkNames.MAINNET]: {
    name: NetworkNames.MAINNET,
    messagePrefix: "\u0015Qtum Signed Message:\n",
    bech32: "bc",
    bip32: { public: 76067358, private: 76066276 },
    pubKeyHash: 58,
    scriptHash: 50,
    wif: 128,
  },
  [NetworkNames.TESTNET]: {
    name: NetworkNames.TESTNET,
    messagePrefix: "\u0015Qtum Signed Message:\n",
    bech32: "tb",
    bip32: { public: 70617039, private: 70615956 },
    pubKeyHash: 120,
    scriptHash: 110,
    wif: 239,
  },
  [NetworkNames.REGTEST]: {
    name: NetworkNames.REGTEST,
    messagePrefix: "\u0015Qtum Signed Message:\n",
    bech32: "tb",
    bip32: { public: 70617039, private: 70615956 },
    pubKeyHash: 120,
    scriptHash: 110,
    wif: 239,
  },
}

export class Network {
  constructor(public info: INetworkInfo) {}

  /**
   * Restore a HD-wallet address from mnemonic & password
   *
   * @param mnemonic
   * @param password
   *
   */
  public fromMnemonic(mnemonic: string, password?: string): Wallet {
    // if (bip39.validateMnemonic(mnemonic) == false) return false
    const seedHex = bip39.mnemonicToSeedSync(mnemonic, password).toString('hex')
    const hdNode = HDNode.fromSeedHex(seedHex, this.info)
    const account = hdNode
      .deriveHardened(88)
      .deriveHardened(0)
      .deriveHardened(0)
    const keyPair = account.keyPair

    return new Wallet(keyPair, this.info)
  }

  /**
   * constructs a wallet from bip38 encrypted private key
   * @param encrypted private key string
   * @param passhprase password
   * @param scryptParams scryptParams
   */
  public fromEncryptedPrivateKey(
    encrypted: string,
    passhprase: string,
    scryptParams: IScryptParams = params.bip38,
  ): Wallet {
    const { privateKey, compressed } = bip38.decrypt(
      encrypted,
      passhprase,
      undefined,
      scryptParams,
    )
    const decoded = wifEncoder.encode(this.info.wif, privateKey, compressed)

    return this.fromWIF(decoded)
  }

  /**
   * Restore 10 wallet addresses exported from QTUM's mobile clients. These
   * wallets are 10 sequential addresses rooted at the HD-wallet path
   * `m/88'/0'/0'` `m/88'/0'/1'` `m/88'/0'/2'`, and so on.
   *
   * @param mnemonic
   * @param network
   */
  public fromMobile(mnemonic: string): Wallet[] {
    const seedHex = bip39.mnemonicToSeedSync(mnemonic).toString('hex')
    const hdNode = HDNode.fromSeedHex(seedHex, this.info)
    const account = hdNode.deriveHardened(88).deriveHardened(0)
    const wallets: Wallet[] = []
    for (let i = 0; i < 10; i++) {
      const hdnode = account.deriveHardened(i)
      const wallet = new Wallet(hdnode.keyPair, this.info)

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
   */
  public fromWIF(wif: string): Wallet {
    if (!validatePrivateKey(wif)) {
      throw new Error("wif is invalid, it does not satisfy ECDSA")
    }
    const keyPair = ECPair.fromWIF(wif, this.info)

    return new Wallet(keyPair, this.info)
  }

  /**
   * Alias for `fromWIF`
   * @param wif
   */
  public fromPrivateKey(wif: string): Wallet {
    return this.fromWIF(wif)
  }

  public insight(): Insight {
    return Insight.forNetwork(this.info)
  }

  public hexToBase58(input: string): string {
    const buf = Buffer.from(input, "hex")
    return bs58.encode(buf)
  }

  public base58ToHex(input: string) {
    const buf = bs58.decode(input)
    return buf.toString("hex")
  }
}

const mainnet = new Network(networksInfo[NetworkNames.MAINNET])
const testnet = new Network(networksInfo[NetworkNames.TESTNET])
const regtest = new Network(networksInfo[NetworkNames.REGTEST])

export const networks = {
  mainnet,
  testnet,
  regtest,
}
