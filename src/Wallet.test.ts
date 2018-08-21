import { assert } from "chai"

import { networks, generateMnemonic, NetworkNames } from "./"
import { generateBlock } from "./qtumRPC"
import { sleep } from "./time"
import { params } from "./scrypt"

describe("Wallet", () => {
  const network = networks.regtest

  it("generates mnemonic of 12 words", () => {
    const mnemonic = generateMnemonic()
    assert.isString(mnemonic)

    const words = mnemonic.split(" ")
    assert.equal(words.length, 12)
  })

  const testMnemonic = "behind lunar size snap unfold stereo case shift flavor shove cricket divorce"
  const password = "covfefe"

  it("recovers wallet from mnemonic", async () => {
    const wallet = await network.fromMnemonic(testMnemonic)
    assert.equal(wallet.address, "qPVw7ZSjV8G2Xdr6rtxhR2riWf9SDkzDVo")
  })

  it("recovers wallet from mnemonic with password", async () => {
    const wallet = await network.fromMnemonic(testMnemonic, password)

    assert.equal(wallet.address, "qJSUjMyHRZ4J1DmsCKd4R14cmb8CAWLZG8")
  })

  const wifPrivateKey = "cMbgxCJrTYUqgcmiC1berh5DFrtY1KeU4PXZ6NZxgenniF1mXCRk"

  it("recovers wallet from WIF", () => {
    const wallet = network.fromWIF(wifPrivateKey)

    assert.equal(wallet.address, "qUbxboqjBRp96j3La8D1RYkyqx5uQbJPoW")
  })

  it("recovers wallet from EncryptedPrivateKey", () => {
    const wif = "cNQKccYYQyGX9G9Qxq2DJev9jHygbZpb2UG7EvUapbtDx5XhkhYE"
    const encryptPassword = "testtest"

    const wallet = network.fromWIF(wif)

    const encryptedKey = wallet.toEncryptedPrivateKey(encryptPassword, params.noop)

    const wallet2 = network.fromEncryptedPrivateKey(encryptedKey, encryptPassword, params.noop)

    assert.equal(wallet2.toWIF(), wif)
  })

  it("dumps wallet to WIF", () => {
    const wallet = network.fromWIF(wifPrivateKey)

    assert.equal(wallet.toWIF(), wifPrivateKey)
  })

  it("gets wallet info", async function () {
    this.timeout(10000)

    const wallet = network.fromWIF(wifPrivateKey)

    const info = await wallet.getInfo()
    assert.containsAllKeys(info, [
      "addrStr",
      "balance",
      "balanceSat",
      "totalReceived",
      "totalReceivedSat",
      "totalSent",
      "totalSentSat",
      "transactions",
    ])
  })

  it("gets wallet transactions", async function () {
    this.timeout(10000)

    const wallet = network.fromWIF(wifPrivateKey)

    const rawTxs = await wallet.getTransactions()

    assert.containsAllKeys(rawTxs, ["txs", "pagesTotal"])
    assert.isArray(rawTxs.txs)
  })

  it("sends payment to a receiving address", async function () {
    this.timeout(20000)

    const insight = network.insight()
    const wallet = network.fromWIF(wifPrivateKey)

    const toAddress = "qLn9vqbr2Gx3TsVR9QyTVB5mrMoh4x43Uf"
    const amount = 1e8 // 1 qtum (in sat)

    const senderOldInfo = await insight.getInfo(wallet.address)
    const receiverOldInfo = await insight.getInfo(toAddress)

    const tx = await wallet.send(toAddress, amount, {
      feeRate: 4000, // 0.04 qtum / KB
    })
    assert.isNotEmpty(tx.txid)

    await generateBlock(network)
    await sleep(2000)

    const senderNewInfo = await insight.getInfo(wallet.address)
    const receiverNewInfo = await insight.getInfo(toAddress)

    assert.equal(senderOldInfo.balanceSat - senderNewInfo.balanceSat, Math.round(1.009 * 1e8), "sender")
    assert.equal(receiverNewInfo.balanceSat - receiverOldInfo.balanceSat, 1e8, "receiver")
  })
})
