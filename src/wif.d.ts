declare module "wif" {
  function encode(network: number, privateKey: Buffer, compressed: boolean): string
  function decode(wif: string): { privateKey: Buffer, compressed: boolean }
}
