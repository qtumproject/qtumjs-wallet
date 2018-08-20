// https://blog.filippo.io/the-scrypt-parameters/

export interface IScryptParams {
  N: number,
  r: number,
  p: number,
}

export default {
  N: 16384,
  r: 8,
  p: 8,
}
