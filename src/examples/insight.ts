import { networks, Insight } from "../index"

async function main() {
  const network = networks.testnet

  const insight = network.insight()

  for (let i = 1; i <= 32; i++) {
    const feePerByte = await insight.estimateFee(i)
    console.log("estimated fee per byte", feePerByte)
  }

}

main().catch((err) => console.log(err))

/*
OUTPUT:

public address: qWAnfBnRNhZBqtgSdgHjSfS2D5Jawmafra
*/
