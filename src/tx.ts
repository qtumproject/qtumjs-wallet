import {
  ECPair,
  TransactionBuilder,
  script as BTCScript,
} from "bitcoinjs-lib"

import {
  BigNumber,
} from "bignumber.js"

import {
  encode as encodeUInt,
} from "varuint-bitcoin"

import { Buffer } from "buffer"

import { OPS } from "./opcodes"

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

/**
 * This is a function for selecting QTUM utxos to build transactions
 * the transaction object takes at least 3 fields, value(unit is 1e-8 QTUM) , confirmations and isStake
 *
 * @param [transaction] unspentTransactions
 * @param Number amount(unit: QTUM)
 * @param Number fee(unit: QTUM)
 * @returns [transaction]
 */
function selectTxs(utxos: IUTXO[], amount: number, fee: number): IUTXO[] {
  // sort the utxo
  const matureList: IUTXO[] = []
  const immatureList: IUTXO[] = []
  for (const utxo of utxos) {
    if (utxo.confirmations >= 500 || utxo.isStake === false) {
      matureList[matureList.length] = utxo
    } else {
      immatureList[immatureList.length] = utxo
    }
  }
  matureList.sort((a, b) => a.value - b.value)
  immatureList.sort((a, b) => b.confirmations - a.confirmations)
  utxos = matureList.concat(immatureList)

  const value = new BigNumber(amount).plus(fee).times(1e8)
  const find = []
  let findTotal = new BigNumber(0)
  for (const utxo of utxos) {
    findTotal = findTotal.plus(utxo.value)
    find[find.length] = utxo
    if (findTotal.greaterThanOrEqualTo(value)) { break }
  }

  if (value.greaterThan(findTotal)) {
    throw new Error("You do not have enough QTUM to send")
  }

  return find
}

/**
 * Build a pay-to-pubkey-hash transaction
 *
 * @param keyPair
 * @param to
 * @param amount
 * @param fee
 * @param utxoList
 */
export function buildPubKeyHashTransaction(
  keyPair: ECPair,
  to: string,
  amount: number,
  fee: number,
  utxoList: IUTXO[],
) {
  const from = keyPair.getAddress()
  const inputs = selectTxs(utxoList, amount, fee)
  const tx = new TransactionBuilder(keyPair.getNetwork())
  let totalValue = new BigNumber(0)
  const value = new BigNumber(amount).times(1e8)
  const sendFee = new BigNumber(fee).times(1e8)
  for (const input of inputs) {
    tx.addInput(input.hash, input.pos)
    totalValue = totalValue.plus(input.value)
  }
  tx.addOutput(to, new BigNumber(value).toNumber())
  if (totalValue.minus(value).minus(sendFee).toNumber() > 0) {
    tx.addOutput(from, totalValue.minus(value).minus(sendFee).toNumber())
  }
  for (let i = 0; i < inputs.length; i++) {
    tx.sign(i, keyPair)
  }
  return tx.build().toHex()
}

/**
 * Build a create-contract transaction
 *
 * @param keyPair
 * @param code The contract byte code
 * @param gasLimit
 * @param gasPrice (unit: QTUM)
 * @param fee (unit: QTUM)
 * @param utxoList
 * @returns the built tx
 */
export function buildCreateContractTransaction(
  keyPair: ECPair,
  code: string,
  gasLimit: number,
  gasPrice: number,
  fee: number,
  utxoList: IUTXO[],
): string {
  const from = keyPair.getAddress()
  const amount = 0
  fee = new BigNumber(gasLimit).times(gasPrice).div(1e8).add(fee).toNumber()
  const inputs = selectTxs(utxoList, amount, fee)
  const tx = new TransactionBuilder(keyPair.getNetwork())
  let totalValue = new BigNumber(0)
  const sendFee = new BigNumber(fee).times(1e8)
  for (const input of inputs) {
    tx.addInput(input.hash, input.pos)
    totalValue = totalValue.plus(input.value)
  }
  const contract = BTCScript.compile([
    OPS.OP_4,
    encodeUInt(gasLimit),
    encodeUInt(gasPrice),
    Buffer.from(code, "hex"),
    OPS.OP_CREATE,
  ])

  tx.addOutput(contract, 0)
  if (totalValue.minus(sendFee).toNumber() > 0) {
    tx.addOutput(from, totalValue.minus(sendFee).toNumber())
  }

  // This assumes that each utxo has the same address?
  for (let i = 0; i < inputs.length; i++) {
    tx.sign(i, keyPair)
  }

  return tx.build().toHex()
}

/**
 * Build a send-to-contract transaction
 *
 * @param keyPair
 * @param contractAddress
 * @param encodedData
 * @param amount Value to transfer to the contract. (unit: QTUM)
 * @param gasLimit
 * @param gasPrice (unit: satoshi / gas)
 * @param fee (unit: QTUM)
 * @param utxoList
 * @returns the built tx
 */
export function buildSendToContractTransaction(
  keyPair: ECPair,
  contractAddress: string,
  encodedData: string,
  amount: number,
  gasLimit: number,
  gasPrice: number,
  fee: number,
  utxos: IUTXO[],
) {
  // FIXME. change explicit fee to feeRatePerByte
  const from = keyPair.getAddress()

  fee = new BigNumber(gasLimit).times(gasPrice).div(1e8).add(fee).toNumber()
  const inputs = selectTxs(utxos, amount, fee)
  const tx = new TransactionBuilder(keyPair.getNetwork())

  let totalValue = new BigNumber(0) // in satoshi
  const sendFee = new BigNumber(fee).times(1e8) // in satoshi

  for (const input of inputs) {
    tx.addInput(input.hash, input.pos)
    totalValue = totalValue.plus(input.value)
  }

  const contract = BTCScript.compile([
    OPS.OP_4,
    encodeUInt(gasLimit),
    encodeUInt(gasPrice),
    Buffer.from(encodedData, "hex"),
    Buffer.from(contractAddress, "hex"),
    OPS.OP_CALL,
  ])

  tx.addOutput(contract, toSatoshi(amount))

  // change output (in satoshi)
  const change = totalValue.minus(sendFee).minus(toSatoshi(amount)).toNumber()
  if (change > 0) {
    tx.addOutput(from, change)
  }

  for (let i = 0; i < inputs.length; i++) {
    tx.sign(i, keyPair)
  }
  return tx.build().toHex()
}

function toSatoshi(value: number): number {
  return new BigNumber(value).times(1e8).toNumber()
}
