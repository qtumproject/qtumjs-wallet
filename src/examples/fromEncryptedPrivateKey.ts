import { networks } from "../index"

async function main() {
  const network = networks.testnet
  const encrypted = "6PYVKJXXQ7eyTgGizw9NxX4nz1u185GqF28NWudxvyWZUh8QyJ9u2AqxWM"
  const password = "covfefe"

  const startAt = new Date().getTime()
  const wallet = await network.fromEncryptedPrivateKey(encrypted, password)
  const endAt = new Date().getTime()

  console.log("public address:", wallet.address)
  console.log("private key (WIF):", wallet.toWIF())
  console.log(`decryption takes ${(endAt - startAt) / 1000} seconds`)
}

main().catch((err) => console.log(err))

/*
Output Example:

public address: qLUHmrFGexxpyHwQphLpE1czZNFE5m1xmV
private key (WIF): cNQKccYYQyGX9G9Qxq2DJev9jHygbZpb2UG7EvUapbtDx5XhkhYE
decryption takes 2.143 seconds
 */
