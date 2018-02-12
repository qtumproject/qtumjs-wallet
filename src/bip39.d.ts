/**
 * Mnemonic code for generating deterministic keys
 *
 * https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
 * https://www.npmjs.com/package/bip39
 */
declare module "bip39" {
  type RNG = (nbytes: number) => Buffer
  /**
   * Generate a random mnemonic (uses crypto.randomBytes under the hood),
   * defaults to 128-bits of entropy
   *
   * @param strength Number of bits of entropy. Must be in range of [128...256] and modular 32. (Default=128)
   */
  function generateMnemonic(strength?: number, rng?: () => RNG): string

  function mnemonicToSeed(mnemonic: string, password?: string): Buffer
  function mnemonicToSeedHex(mnemonic: string, password?: string): string
}
