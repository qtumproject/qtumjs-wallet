declare module "coinselect" {
  interface IOutput {
    value: number

    address?: string
    script?: Buffer
  }

  interface IInput {
    value: number

    script?: Buffer
  }

  function coinSelect<I extends IInput>(utxos: I[], outputs: IOutput[], feeRate: number): {
    inputs?: I[]
    outputs?: IOutput[]
    fee: number,
  }

  export = coinSelect
}
