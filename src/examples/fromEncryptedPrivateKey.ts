import { networks } from "../index"

async function main() {
  const network = networks.testnet
  const encrypted = "6PYVKJXXQ7eyTgGizw9NxX4nz1u185GqF28NWudxvyWZUh8QyJ9u2AqxWM"
  const password = "covfefe"

  const wallet = network.fromEncryptedPrivateKey(encrypted, password)

  console.log("public address:", wallet.address)
  console.log("private key (WIF):", wallet.toWIF())
}

main().catch((err) => console.log(err))

/*
Output Example:

public address: qf8AaV1j1YxbtMdHTU3kXpbg2AkgdBWQyY
private key (WIF): cMeDKMEixvcZ7jAiCQH5XNthY3Lynsbqfdv5X6F2Tuc1gsAvMWtX
 */
