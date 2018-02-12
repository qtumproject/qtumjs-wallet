
declare module "qtumjs-lib" {
  interface INetwork {
    messagePrefix: string
    bech32: string

    // HDWallet https://en.bitcoin.it/wiki/BIP_0032
    bip32: {
      public: number
      private: number
    }

    pubKeyHash: number
    scriptHash: number
    wif: number
  }

  const networks: {
    // bitcoin
    bitcoin: INetwork,
    testnet: INetwork,

    // qtum
    qtum: INetwork,
    qtum_testnet: INetwork,
  }

  // https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/src/ecpair.js
  class ECPair {
    static fromWIF(privateKey: string, network?: INetwork): ECPair

    getNetwork(): INetwork

    /**
     * Get the base58 formatted public address
     *
     * See: https://en.bitcoin.it/wiki/Address
     */
    getAddress(): string

    /**
     * Export keypair to Wallet Import Format (WIF)
     *
     * See: https://en.bitcoin.it/wiki/Wallet_import_format
     */
    toWIF(): string
  }

  // https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/src/hdnode.js
  class HDNode {
    static fromSeedHex(hex: string, network: INetwork): HDNode
    static fromSeedBuffer(seed: Buffer, network: INetwork): HDNode

    public keyPair: ECPair

    constructor(keyPair: ECPair, chainCode: Buffer)

    deriveHardened(index: number): HDNode
    derive(index: number): HDNode

    /**
     *
     * @param path A HD wallet path. e.g. `m/0/0/0'/1`
     */
    derivePath(path: string): HDNode
  }


  export interface IUTXO {
    // This structure is slightly different from that returned by Insight API
    address: string
    txid: string
    hash: string // txid

    pos: number // vout (insight)

    /**
     * Public key that controls this UXTO, as hex string.
     */
    scriptPubKey: string

    amount: number
    value: number // satoshi (insight)

    isStake: boolean
    confirmations: number
  }

  namespace utils {
    /**
     * This is a function for selecting QTUM utxos to build transactions the
     * transaction object takes at least 3 fields, value(unit is 1e-8 QTUM) ,
     * confirmations and isStake
     *
     * @param utxos
     * @param amount (unit: QTUM)
     * @param fee (unit: QTUM)
     * @returns [transaction]
     */
    function selectTxs(utxos: IUTXO[], amount: number, fee: number): IUTXO[]

    function buildPubKeyHashTransaction(
      keyPair: ECPair,
      to: string,
      amount: number,
      fee: number,
      utxos: IUTXO[],
    ): string
  }
}
