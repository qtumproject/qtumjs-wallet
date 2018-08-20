import { assert } from "chai"

import { Wallet, networks } from "../src"
import { sleep } from "../src/time"
import { generateBlock } from "./qtumRPC"

describe("Contract", () => {
  const network = networks.regtest
  const wifPrivateKey = "cMbgxCJrTYUqgcmiC1berh5DFrtY1KeU4PXZ6NZxgenniF1mXCRk"
  const wallet: Wallet = network.fromWIF(wifPrivateKey)

  before(async () => {
    // Avoid insight API 400 error
    await sleep(1000)
  })

  let txid: string

  it("creates a contract", async function() {
    this.timeout(10000)

    // tslint:disable:max-line-length
    const code = "608060405234801561001057600080fd5b506040516020806101a08339810180604052810190808051906020019092919050505080600081905550506101568061004a6000396000f30060806040526004361061004c576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806360fe47b1146100515780636d4ce63c1461007e575b600080fd5b34801561005d57600080fd5b5061007c600480360381019080803590602001909291905050506100a9565b005b34801561008a57600080fd5b50610093610121565b6040518082815260200191505060405180910390f35b807f61ec51fdd1350b55fc6e153e60509e993f8dcb537fe4318c45a573243d96cab433600054604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a28060008190555050565b600080549050905600a165627a7a7230582046690add90673a282f8c66726ec3e7803a56ddb8c9b7ec6a844b0b447c005d8b00290000000000000000000000000000000000000000000000000000000000000064"
    // tslint:enable:max-line-length

    const tx = await wallet.contractCreate(code)
    txid = tx.txid
    assert.isNotEmpty(txid)

    await generateBlock(network)
  })

  let contractAddress: string
  it("gets transaction info", async function() {
    this.timeout(10000)
    const insight = network.insight()

    const info = await insight.getTransactionInfo(txid)
    assert.equal(info.txid, txid)

    const receipt = info.receipt[0]
    assert.equal(receipt.to, "0000000000000000000000000000000000000000")
    assert.equal(receipt.excepted, "None")

    contractAddress = receipt.contractAddress
    assert.isNotEmpty(contractAddress)
  })

  it("invokes contractCall", async function() {
    this.timeout(10000)

    // get
    const encodedData = "6d4ce63c"
    const result = await wallet.contractCall(contractAddress, encodedData)

    const executionResult = result.executionResult
    assert.equal(executionResult.output, "0000000000000000000000000000000000000000000000000000000000000064")
  })

  it("invokes contractSend", async function() {
    this.timeout(10000)

    const encodedData = "60fe47b10000000000000000000000000000000000000000000000000000000000000001"
    const tx = await wallet.contractSend(contractAddress, encodedData)

    await generateBlock(network)

    await sleep(1000)

    const result = await wallet.contractCall(contractAddress, "6d4ce63c")

    const executionResult = result.executionResult
    assert.equal(executionResult.output, "0000000000000000000000000000000000000000000000000000000000000001")
  })
})
