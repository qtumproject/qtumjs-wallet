import { networks } from "../index"

async function main() {
  const network = networks.testnet
  const mnemonic = "hold struggle ready lonely august napkin enforce retire pipe where avoid drip"
  const password = "covfefe"

  const wallet = await network.fromMnemonic(mnemonic, password)

  console.log("public address:", wallet.address)
  console.log("private key (WIF):", wallet.toWIF())

  const startAt = new Date().getTime()
  const encrypted = await wallet.toEncryptedPrivateKey(password)

  console.log("encrypted bip38 private key is:", encrypted)

  const endAt = new Date().getTime()

  console.log(`encryption takes ${(endAt - startAt) / 1000} seconds`)
}

main().catch((err) => console.log(err))

/*
Output Example:

public address: qLUHmrFGexxpyHwQphLpE1czZNFE5m1xmV
private key (WIF): cNQKccYYQyGX9G9Qxq2DJev9jHygbZpb2UG7EvUapbtDx5XhkhYE
encrypted bip38 private key is: 6PYVKJXXQ7eyTgGizw9NxX4nz1u185GqF28NWudxvyWZUh8QyJ9u2AqxWM
encryption takes 2.096 seconds
 */
