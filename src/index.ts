export * from "./Wallet"
export * from "./Insight"
export * from "./Network"
export * from "./WalletRPCProvider"

import * as bip39 from "bip39"

export function generateMnemonic(): string {
  return bip39.generateMnemonic()
}
