import { networks } from "../index"

async function main() {
  const network = networks.testnet

  const privateKey = "cQxduP5sUjM6Mwn6wxXhwta5BnU7QmbNfm83Hcfj3fQeiQKCfjBA"
  const wallet = network.fromWIF(privateKey)

  const info = await wallet.getInfo()
  console.log(info)
}

main().catch((err) => console.log(err))

/*
OUTPUT:

public address: qWAnfBnRNhZBqtgSdgHjSfS2D5Jawmafra
*/
