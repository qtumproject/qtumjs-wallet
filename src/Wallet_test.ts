import { assert } from "chai"

import { Wallet } from "./Wallet"
import { networks, generateMnemonic } from "./"

describe("Wallet", () => {
  const network = networks.testnet

  it("generates mnemonic of 12 words", () => {
    const mnemonic = generateMnemonic()
    assert.isString(mnemonic)

    const words = mnemonic.split(" ")
    assert.equal(words.length, 12)
  })

  const testMnemonic = "behind lunar size snap unfold stereo case shift flavor shove cricket divorce"

  it("recovers wallet from mnemonic", async () => {
    const wallet = await network.fromMnemonic(testMnemonic)
    assert.equal(wallet.address, "qPVw7ZSjV8G2Xdr6rtxhR2riWf9SDkzDVo")
  })

  it("recovers wallet from mnemonic", async () => {
    const wallet = await network.fromMnemonic(testMnemonic)

    const childWallet0 = wallet.deriveChildWallet()
    const childWallet1 = wallet.deriveChildWallet(1)

    assert.equal(childWallet0.address, "qf8KcZ6TYMnQmv3ZYUvsisPxuQqf68b9d7")
    assert.equal(childWallet1.address, "qUD22hN4sPgGiapzxnPSmZiCFQ6SXpP3pC")
  })
})
