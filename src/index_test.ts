import "mocha"
import { assert } from "chai"

import { hello } from "./index"

describe("hello", () => {
  it("says hello world", () => {
    assert.equal(hello(), "hello world")
  })
})
