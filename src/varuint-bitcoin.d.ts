declare module "varuint-bitcoin" {
  function encode(number: number, buffer?: Buffer, offset?: number): Buffer
  function decode(buffer: Buffer, offset?: number): Buffer
  function encodingLength(n: number): number
}
