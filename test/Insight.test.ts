import { assert } from "chai"

import { networks } from "../src"

describe("Insight", async function() {
  this.timeout(10000)

  const network = networks.regtest
  const insight = network.insight()

  it("estimates fee per byte", async () => {
    for (let i = 1; i <= 32; i++) {
      const feePerByte = await insight.estimateFee(i)
      // It always return -1 for testnet.
      assert.equal(feePerByte, -1)
    }
  })
})
