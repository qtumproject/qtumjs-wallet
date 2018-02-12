export interface INetworkInfo {
  name: string

  messagePrefix: string
  bech32: string

  // HDWallet https://en.bitcoin.it/wiki/BIP_0032
  bip32: {
    public: number,
    private: number,
  }

  pubKeyHash: number
  scriptHash: number
  wif: number
}

export enum NetworkNames {
  MAINNET = "qtum",
  TESTNET = "qtum_testnet",
}

export const networks: { [key: string]: INetworkInfo } = {
  [NetworkNames.MAINNET]: {
    name: NetworkNames.MAINNET,
    messagePrefix: "\u0018Qtum Signed Message:\n",
    bech32: "bc",
    bip32: { public: 76067358, private: 76066276 },
    pubKeyHash: 58,
    scriptHash: 50,
    wif: 128,
  },
  [NetworkNames.TESTNET]: {
    name: NetworkNames.TESTNET,
    messagePrefix: "\u0018Qtum Signed Message:\n",
    bech32: "tb",
    bip32: { public: 70617039, private: 70615956 },
    pubKeyHash: 120,
    scriptHash: 110,
    wif: 239,
  },
}
