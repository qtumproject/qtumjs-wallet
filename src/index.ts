export * from "./Wallet"
export * from "./Insight"
export * from "./Network"

import * as bip39 from "bip39"

export function generateMnemonic(): string {
  return bip39.generateMnemonic()
}
