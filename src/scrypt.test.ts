import { scrypt, params } from "./scrypt"
import { assert } from "chai"

describe("scrypt", () => {
  it("can hash data with scrypt", () => {
    const result = scrypt("foobar", {
      // use bip38 for production
      // params: params.bip38,
      params: params.noop,
      // progress: (status) => {
      //   console.log("status", status)
      // },
    })

    assert.equal(result, "d6c18ddc68a3d6f6289cffcd36ef3b4ff3be32027bc1660701848a5e8d9d1d76")
  })
})
