export * from "./Wallet"
export * from "./Insight"
export * from "./Network"
export * from "./WalletRPCProvider"

import * as bip39 from "bip39"
import { decode } from "wif"
import { privateKeyVerify } from "secp256k1"

export function generateMnemonic(): string {
  return bip39.generateMnemonic()
}

export function validatePrivateKey(wif: string): boolean {
  try {
    const decoded = decode(wif)
    return privateKeyVerify(decoded.privateKey)
  } catch (e) {
    return false
  }
}
