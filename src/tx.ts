import {
  ECPair,
  TransactionBuilder,
  script as BTCScript,
} from "bitcoinjs-lib"

import {
  encode as encodeCScriptInt,
} from "bitcoinjs-lib/src/script_number"

import {
  BigNumber,
} from "bignumber.js"

import { Buffer } from "buffer"

import { OPS } from "./opcodes"

import coinSelect = require("coinselect")

/**
 * Options for a payment transaction
 */
export interface ISendTxOptions {
  /**
   * Fee rate to pay for the raw transaction data (satoshi per byte). The
   * default value is the query result of the network's fee rate.
   */
  feeRate?: number
}

export interface IContractSendTXOptions {
  /**
   * unit: satoshi
   */
  amount?: number

  /**
   * unit: satoshi
   */
  gasLimit?: number

  /**
   * unit: satoshi / gas
   */
  gasPrice?: number

  /**
   * unit: satoshi / kilobyte
   */
  feeRate?: number
}

export interface IUTXO {
  // This structure is slightly different from that returned by Insight API
  address: string
  txid: string
  hash: string // txid

  pos: number // vout (insight)

  /**
   * Public key that controls this UXTO, as hex string.
   */
  scriptPubKey: string

  amount: number
  value: number // satoshi (insight)

  isStake: boolean
  confirmations: number
}

function ensureAmountInteger(n: number) {
  if (!Number.isInteger(n)) {
    throw new Error(`Expect tx amount to be an integer, got: ${n}`)
  }
}

/**
 * Build a pay-to-pubkey-hash transaction
 *
 * @param keyPair
 * @param to
 * @param amount (unit: satoshi)
 * @param feeRate
 * @param utxoList
 */
export function buildPubKeyHashTransaction(
  utxos: IUTXO[],
  keyPair: ECPair,
  to: string,
  amount: number,
  feeRate: number,
) {

  ensureAmountInteger(amount)

  const senderAddress = keyPair.getAddress()

  const {
    inputs,
    fee: txfee,
  } = coinSelect(utxos, [
    { value: amount, address: to },
  ], feeRate)

  if (inputs == null) {
    throw new Error("could not find UTXOs to build transaction")
  }

  const txb = new TransactionBuilder(keyPair.getNetwork())

  let vinSum = new BigNumber(0)
  for (const input of inputs) {
    txb.addInput(input.hash, input.pos)
    vinSum = vinSum.plus(input.value)
  }

  txb.addOutput(to, amount)

  const change = vinSum.minus(txfee).minus(amount).toNumber()
  if (change > 0) {
    txb.addOutput(senderAddress, change)
  }

  for (let i = 0; i < inputs.length; i++) {
    txb.sign(i, keyPair)
  }
  return txb.build().toHex()
}

/**
 * Build a create-contract transaction
 *
 * @param keyPair
 * @param code The contract byte code
 * @param feeRate Fee per byte of tx. (unit: satoshi)
 * @param utxoList
 * @returns the built tx
 */
export function buildCreateContractTransaction(
  utxos: IUTXO[],
  keyPair: ECPair,
  code: string,
  feeRate: number,
  opts: IContractSendTXOptions = {},
): string {

  const gasLimit = opts.gasLimit || defaultContractSendTxOptions.gasLimit
  const gasPrice = opts.gasPrice || defaultContractSendTxOptions.gasPrice
  const gasLimitFee = new BigNumber(gasLimit).times(gasPrice).toNumber()

  if (opts.amount != null) {
    throw new Error("Cannot send value to a contract when creating it")
  }

  const createContractScript = BTCScript.compile([
    OPS.OP_4,
    encodeCScriptInt(gasLimit),
    encodeCScriptInt(gasPrice),
    Buffer.from(code, "hex"),
    OPS.OP_CREATE,
  ])

  const fromAddress = keyPair.getAddress()
  const amount = 0

  const {
    inputs,
    fee: txfee,
  } = coinSelect(utxos, [
    { value: gasLimitFee }, // gas fee
    { script: createContractScript, value: amount }, // script + transfer amount to contract
  ], feeRate)

  if (inputs == null) {
    throw new Error("could not find UTXOs to build transaction")
  }

  const txb = new TransactionBuilder(keyPair.getNetwork())

  let totalValue = new BigNumber(0)
  for (const input of inputs) {
    txb.addInput(input.hash, input.pos)
    totalValue = totalValue.plus(input.value)
  }

  // create-contract output
  txb.addOutput(createContractScript, 0)

  const change = totalValue.minus(txfee).minus(gasLimitFee).toNumber()

  if (change > 0) {
    txb.addOutput(fromAddress, change)
  }

  for (let i = 0; i < inputs.length; i++) {
    txb.sign(i, keyPair)
  }

  return txb.build().toHex()
}

const defaultContractSendTxOptions = {
  gasLimit: 250000,
  gasPrice: 40, // 40 satoshi / gas
  amount: 0,

  // Wallet uses only one address. Can't really support senderAddress.
  // senderAddress
}

/**
 * Build a send-to-contract transaction
 *
 * @param keyPair
 * @param contractAddress
 * @param encodedData
 * @param feeRate Fee per byte of tx. (unit: satoshi / byte)
 * @param utxoList
 * @returns the built tx
 */
export function buildSendToContractTransaction(
  utxos: IUTXO[],
  keyPair: ECPair,
  contractAddress: string,
  encodedData: string,
  feeRate: number,
  opts: IContractSendTXOptions = {},
): string {

  // feeRate must be an integer number, or coinselect would always fail
  feeRate = Math.floor(feeRate)

  const gasLimit = opts.gasLimit || defaultContractSendTxOptions.gasLimit
  const gasPrice = opts.gasPrice || defaultContractSendTxOptions.gasPrice
  const amount = opts.amount || defaultContractSendTxOptions.amount

  ensureAmountInteger(amount)

  const senderAddress = keyPair.getAddress()

  // excess gas will refund in the coinstake tx of the mined block
  const gasLimitFee = new BigNumber(gasLimit).times(gasPrice).toNumber()

  const opcallScript = BTCScript.compile([
    OPS.OP_4,
    encodeCScriptInt(gasLimit),
    encodeCScriptInt(gasPrice),
    Buffer.from(encodedData, "hex"),
    Buffer.from(contractAddress, "hex"),
    OPS.OP_CALL,
  ])

  const {
    inputs,
    fee: txfee,
  } = coinSelect(utxos, [
    { value: gasLimitFee }, // gas fee
    { script: opcallScript, value: amount }, // script + transfer amount to contract
  ], feeRate)

  if (inputs == null) {
    throw new Error("could not find UTXOs to build transaction")
  }

  const txb = new TransactionBuilder(keyPair.getNetwork())

  // add inputs to txb
  let vinSum = new BigNumber(0)
  for (const input of inputs) {
    txb.addInput(input.hash, input.pos)
    vinSum = vinSum.plus(input.value)
  }

  // send-to-contract output
  txb.addOutput(opcallScript, amount)

  // change output (in satoshi)
  const change = vinSum.minus(txfee).minus(gasLimitFee).minus(amount).toNumber()
  if (change > 0) {
    txb.addOutput(senderAddress, change)
  }

  for (let i = 0; i < inputs.length; i++) {
    txb.sign(i, keyPair)
  }

  return txb.build().toHex()
}

// The prevalent network fee is 0.004 per KB. If set to 100 times of norm, assume error.
const MAX_FEE_RATE = Math.ceil(0.004 * 100 * 1e8 / 1024)

function checkFeeRate(feeRate: number) {
  if (feeRate > MAX_FEE_RATE) {
    throw new Error("Excessive tx fees, is set to 100 times of norm.")
  }
}
