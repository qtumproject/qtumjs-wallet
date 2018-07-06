import { networks, Insight } from "../index"

async function main() {
  const network = networks.testnet

  const insight = network.insight()

  const info = await insight.getTransactionInfo("f20914f3d810010c0a74df60abb3fcf0d3ff2669d944ce187f079ec9faec563e")
  console.log(info)
}

main().catch((err) => console.log(err))
