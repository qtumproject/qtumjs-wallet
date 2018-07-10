import { networks } from "../index"

async function main() {
  const network = networks.testnet
  const mnemonic = "hold struggle ready lonely august napkin enforce retire pipe where avoid drip"
  const password = "covfefe"

  const wallet = network.fromMnemonic(mnemonic, password)

  console.log("public address:", wallet.address)
  console.log("private key (WIF):", wallet.toWIF())
  console.log("encrypted bip38 private key is:", wallet.toEncryptedPrivateKey(password))
}

main().catch((err) => console.log(err))

/*
Output Example:

public address: qLUHmrFGexxpyHwQphLpE1czZNFE5m1xmV
private key (WIF): cNQKccYYQyGX9G9Qxq2DJev9jHygbZpb2UG7EvUapbtDx5XhkhYE
encrypted bip38 private key is: 6PYVKJXXQdWDyWuEbKfAhbArk41kLUk18jbYRANUhShKFfxhjLh6vh9G52
 */
