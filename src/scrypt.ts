// https://blog.filippo.io/the-scrypt-parameters/
// https://go-review.googlesource.com/c/crypto/+/67070/3/scrypt/scrypt.go

import { sha256 } from "hash.js"
const scryptsy = require("scryptsy")

export interface IScryptParams {
  N: number,
  r: number,
  p: number,
}

export const params = {
  bip38: {
    N: 16384,
    r: 8,
    p: 8,
  } as IScryptParams,
  golang: {
    N: 32768,
    r: 8,
    p: 1,
  } as IScryptParams,
  noop: {
    N: 2,
    r: 8,
    p: 1,
  } as IScryptParams,
}

// TODO: remove default export
export default params.bip38

interface IScryptProgress {
  current: number,
  total: number,
  percent: number,
}

type ScryptProgressCallbackFunction = (report: IScryptProgress) => any

interface IScryptOptions {
  /**
   * Parameters to the scrypt function.
   *
   * N = round
   * r = memory factor
   * p = CPU parallelism factor
   */
  params?: IScryptParams,

  /**
   * The length of the result hash in bytes
   */
  length?: number,

  /**
   * Progress callback that's invoked every 1000 rounds
   */
  progress?: ScryptProgressCallbackFunction,
}

// helper function for scrypt
export function scrypt(
  data: string,
  opts: IScryptOptions = {},
): string {
  const { N, r, p } = opts.params || params.bip38

  const salt = sha256().update(data).digest("hex")

  const length = opts.length || 32

  const result = scryptsy(data, salt, N, r, p, length, opts.progress)
  return result.toString("hex")
}
