import { networks } from "../index"

async function main() {
  const network = networks.testnet

  const privateKey = "cVEwiJ5NMTdnkW4ZW2ykUopawtLPXQWtPDmvpTh5jmXYMtg8itAz"

  const wallet = network.fromWIF(privateKey)
  console.log("public address:", wallet.address)
}

main().catch((err) => console.log(err))

/*
OUTPUT:

public address: qWAnfBnRNhZBqtgSdgHjSfS2D5Jawmafra
*/
