declare module "bs58check.d" {
  type RNG = (nbytes: number) => Buffer
  /**
   * Generate a random mnemonic (uses crypto.randomBytes under the hood),
   * defaults to 128-bits of entropy
   *
   * @param strength Number of bits of entropy. Must be in range of [128...256] and modular 32. (Default=128)
   */
  function decode(input: string): Buffer
  function decodeUnsafe(input: string): Buffer
  function encode(input: Buffer): string

}
