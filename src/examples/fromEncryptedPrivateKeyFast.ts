import { networks } from "../index"

async function main() {
  try {
    const network = networks.testnet
    const encrypted = "6PYVKJXXQG722hd9FcbpkUamyG2kK3Cb7eXZV5NJSABcayC9wy5RHQNYXc"
    const password = "covfefe"

    const startAt = new Date().getTime()
    const wallet = await network.fromEncryptedPrivateKey(encrypted, password, {N: 8192, r: 8, p: 8})
    const endAt = new Date().getTime()

    console.log("public address:", wallet.address)
    console.log("private key (WIF):", wallet.toWIF())
    console.log(`decryption takes ${(endAt - startAt) / 1000} seconds`)
  } catch (e) {
    console.log(e)
  }
}

main()

/*
Output Example:

public address: qLUHmrFGexxpyHwQphLpE1czZNFE5m1xmV
private key (WIF): cNQKccYYQyGX9G9Qxq2DJev9jHygbZpb2UG7EvUapbtDx5XhkhYE
decryption takes 1.16 seconds
 */
