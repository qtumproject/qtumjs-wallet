const { networks, generateMnemonic } = require("qtumjs-wallet");

async function main() {
  const network = networks.testnet;
  const mnemonic = generateMnemonic();
  const password = "covfefe";

  const wallet = network.fromMnemonic(mnemonic, password);

  console.log("mnemonic:", mnemonic);
  console.log("public address:", wallet.address);
  console.log("private key (WIF):", wallet.toWIF());

  alert(`generated a random ${wallet.address}`)
}

// main().catch(err => console.log(err));

window.addEventListener("load", main)