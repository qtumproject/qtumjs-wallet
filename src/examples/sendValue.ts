import { networks } from "../index"

async function main() {
  const network = networks.testnet

  const privateKey = "cQxduP5sUjM6Mwn6wxXhwta5BnU7QmbNfm83Hcfj3fQeiQKCfjBA"

  const wallet = await network.fromWIF(privateKey)

  console.log("wallet address:", wallet.address)

<<<<<<< HEAD
  const toAddress = "qJ4dbsuuASNkMTBReZ1hf4MLjfJAAiaiaM"
  const amount = 3 * 1e8
=======
  const toAddress = "qZaTYNEimGLuqnBDpP3KvBKsFs3DbCuwnr"
  const amount = 15000000 // 0.15 qtum (in sat)
>>>>>>> ensure that output amount is an integer

  const rawtx = await wallet.generateTx(toAddress, amount)
  console.log(rawtx)

  const tx = await wallet.send(toAddress, amount, {
    feeRate: 400, // ~0.004 qtum / KB
  })

  // const tx = await wallet.send(toAddress, amount)
  console.log(tx)
}

main().catch((err) => console.log(err))

/*
OUTPUT:

wawllet address: qbkJZTKQfcout2joWVmnvUrJUDTg93bhdv

tx id a9c4a9231e9be3203617cc929189a6df480513bf197543f2cc66539e1bdd2c89
*/
