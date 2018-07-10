# QtumJS Wallet

This is a client-side wallet library that can generate private keys from a mnemonic, or import private keys from other QTUM wallets.

It can sign transactions locally, and submit the raw transaction data to a remote qtum node. The blockchain data is provided by the Insight API (which powers https://explorer.qtum.org/), rather than the raw qtumd RPC calls.

This library makes it possible to run DApp without the users having to run a full qtumd node.

> This library is extracted from the official [QTUM web wallet](https://github.com/qtumproject/qtum-web-wallet).

## Install

```
yarn add qtumjs-wallet
```

## Implementation Notes

There are some differences from the original web wallet repo.

* Removed VUE specific code.
* Removed reactive data setters that are intended to trigger view updates, to make this a plain-old JavaScript module.
* Each wallet instance is instantiated with a network explicitly. This allows simultaneous use of different networks.
* TypeScript for type hinting.
* Uses satoshi (1e8) as internal units
  * Can represent up to ~90 million QTUM accurately.
* Uses [coinselect](https://github.com/bitcoinjs/coinselect) to select utxos.
  * Taking into account the size of a transaction, and multiplies that by fee rate per byte.
  * Uses blackjack algorithm, and fallbacks to simple accumulative.
* Set tx relay fee automatically from fee rate reported by the network.
* send-to-contract transaction can transfer value to the contract

# API

+ [Networks](#networks)
  + [fromWIF](#fromwif)
  + [fromMnemonic](#frommnemonic)
  + [fromEncryptedPrivateKey](#fromencryptedprivatekey)
+ [Wallet](#wallet)
  + [async wallet.getInfo](#async-walletgetinfo)
  + [async wallet.send](#async-walletsend)
  + [async wallet.generateTx](#async-walletgeneratetx)
  + [async wallet.contractSend](#async-walletcontractsend)
  + [async wallet.generateContractSendTx](#async-walletgeneratecontractsendtx)
  + [async wallet.contractCall](#async-walletcontractcall)
  + [async getTransactions](#async-gettransactions)
  + [toEncryptedPrivateKey](#toencryptedprivatekey)


# Examples

## Create Mnemonic+Password Wallet

```js
import { networks, generateMnemonic } from "qtumjs-wallet"

async function main() {
  const network = networks.testnet
  const mnemonic = generateMnemonic()
  const password = "covfefe"

  const wallet = network.fromMnemonic(mnemonic, password)

  console.log("mnemonic:", mnemonic)
  console.log("public address:", wallet.address)
  console.log("private key (WIF):", wallet.toWIF())
}

main().catch((err) => console.log(err))
```

Example Output:

```
mnemonic: hold struggle ready lonely august napkin enforce retire pipe where avoid drip
public address: qLUHmrFGexxpyHwQphLpE1czZNFE5m1xmV
private key (WIF): cNQKccYYQyGX9G9Qxq2DJev9jHygbZpb2UG7EvUapbtDx5XhkhYE
```

## Send Fund

This example restores a wallet from a private key (in [WIF](https://en.bitcoin.it/wiki/Wallet_import_format) format), then sending value to another address.

The transaction is signed locally, and the transaction submitted to a remote API.

The currency unit used is `satoshi`. To convert qtum to satoshi you should multiply the amount you want with `1e8`.

```js
import { networks } from "qtumjs-wallet"

async function main() {
  // Use the test network. Or `networks.mainnet`
  const network = networks.testnet

  const wif = "cU4ficvRNvR7jnbtczCWo5s9rB9Tdg1U4LkArVpGU6cKnDq7LFoP"
  const wallet = network.fromWIF(wif)

  console.log(wallet.address)

  const toAddr = "qS3ThpDn4HRH9we2hZUdF3F3uR7TTvpZ9v"
  // Sending 0.1 qtum
  const sendtx = await wallet.send(toAddr, 1, 0.1 * 1e8)
  console.log("sendtx", sendtx)
}

main().catch((err) => console.log(err))
```

## Send To Contract

Let's burn some money using the `Burn` contract:

```solidity
pragma solidity ^0.4.18;

contract Burn {
  uint256 public totalburned;
  event DidBurn(address burnerAddress, uint256 burnedAmount);

  function burnbabyburn() public payable {
    totalburned = msg.value;
    DidBurn(msg.sender, msg.value);
  }
}
```

The ABI encoding for the `burnbabyburn()` invokation is `e179b912`. We'll burn 0.05 qtum, expressed in unit of satoshi.

```ts
import { networks } from "qtumjs-wallet"

async function main() {
  const network = networks.testnet

  const privateKey = "cU4ficvRNvR7jnbtczCWo5s9rB9Tdg1U4LkArVpGU6cKnDq7LFoP"

  const wallet = network.fromWIF(privateKey)


  const contractAddress = "b10071ee33512ce8a0c06ecbc14a5f585a27a3e2"
  const encodedData = "e179b912" // burnbabyburn()

  const tx = await wallet.contractSend(contractAddress, encodedData, {
    amount: 0.05 * 1e8, // 0.05 qtum in satoshi
  })

  console.log(tx)
}

main().catch((err) => console.log(err))
```

# Networks

Two networks are predefined:

```js
import { networks } from "qtumjs-wallet"

// Main Network
networks.mainnet

// Test Network
networks.testnet
```

## fromPrivateKey

Alias for `fromWIF`.

## fromWIF

`fromWIF` constructs a wallet from private key (in [WIF](https://en.bitcoin.it/wiki/Wallet_import_format) format).

Suppose you want to import the public address `qg3HYD8c4bAVLeEzA9t3Ken3Y3Mni1HZSS`. Use `qtum-cli` to dump the private key from wallet:

```
qcli dumpprivkey qg3HYD8c4bAVLeEzA9t3Ken3Y3Mni1HZSS

cVHzWuEKUxoRKba9ySZFqUKZ9G5W8NkzthRcPaB65amUJs95RM3d
```

```js
const network = networks.testnet

const privateKey = "cVEwiJ5NMTdnkW4ZW2ykUopawtLPXQWtPDmvpTh5jmXYMtg8itAz"

const wallet = network.fromWIF(privateKey)
console.log("public address:", wallet.address)
```

Output:

```
public address: qWAnfBnRNhZBqtgSdgHjSfS2D5Jawmafra
```

## fromMnemonic

`fromMnemonic` constructs a wallet from mnemonic. User can optionally specify a `password` to add to the mnemonic entropy.

```ts
const network = networks.testnet
const mnemonic = "hold struggle ready lonely august napkin enforce retire pipe where avoid drip"
const password = "covfefe"

const wallet = network.fromMnemonic(mnemonic, password)

console.log("public address:", wallet.address)
console.log("private key (WIF):", wallet.toWIF())
```

Example Output:

```
public address: qLUHmrFGexxpyHwQphLpE1czZNFE5m1xmV
private key (WIF): cNQKccYYQyGX9G9Qxq2DJev9jHygbZpb2UG7EvUapbtDx5XhkhYE
```

# Wallet

Wallet manages blockchain access for an address. It is able to create and sign transactions locally for sending a payment or interacting with a smart contract.

You would typically construct a Wallet instance using the factory methods provided by `Network`.

## async wallet.getInfo

Get basic information about the wallet address.

Example:

```ts
const info = await wallet.getInfo()
console.log(info)
```

Output:

```
{ addrStr: 'qbkJZTKQfcout2joWVmnvUrJUDTg93bhdv',
  balance: 128.47960699,
  balanceSat: 12847960699,
  totalReceived: 599.92142295,
  totalReceivedSat: 59992142295,
  totalSent: 471.44181596,
  totalSentSat: 47144181596,
  unconfirmedBalance: 0,
  unconfirmedBalanceSat: 0,
  unconfirmedTxApperances: 0,
  txApperances: 21,
  transactions:
   [ 'd12ff9cfd76836d8eb5a39bc40f1dc5e6e2032bfa132f66cca638a7e76f2b6e7',
     '44fa64f34361cf5460ca116ea396098eb0d20dd43839375c07d69a282d4e29b6',
     'ca86c477bc595f08f158eed0d4307ee6e1e674a2c14f808b013b38cb1e929aa0',
     'fbf41aaca56dd013934471b4630f8ca52a6216cf791701a07f3e5c0ba16902d5',
     'af8fff4a74ff9217d629c17aa84412e8810888983cbc4f6b764740e68b51e5d0',
     'e9172194ef9493a2dd8dddd02aa58a1c13dbfb09a7e04cb97558d951e4b93a88',
     '3e167a2534d5d18b71ba56bbba8bfdb317711b3f2ef30f10d34941ddc9aa4861',
     'bd15b9d9cf4e94915e246a7d78de14cb0a6acec12624902b45717997ef71854e',
     '0c99d68c261dd713819c068bd0213bc048bd4928b3d86d71503bb3348d7f42f5',
     'd5b823bb524862855181d231e716ff86fa301f701fd4c23b68168debe334da2e',
     '7660e89eb45b536b9c7527edafc0884fc2941c0f050625780d3e100c8aeb28f4',
     'eddbbac9bb7dae1cf4093d893133eb52c483b13ea66f6354c63302f9127ec1bd',
     '6f99149d78ad720591b4cca643fe2599a0a07076f8f3e80b5962cba326772e83',
     '0ef2548cceaaa41b7c0127f6e943d103f2fcc236d05e59593e05381f7a8474a0',
     '851753842d80e8dea92de643e0f3784cf7cbdbb02ae879593cbeac2c78560bac',
     '729c839d63f7426a1f4ada7eb5a35b556556665a4b42e102694674551752bb03',
     'ee50d8422dce064d40eb021f4829f5b871e8d2927d93ea136dc0df01b1a72e08',
     'caf8b48b9d38c3a27de3d24c5a738f63ec37619d419cfcd061bc991d8369bda3',
     '3b59444033d61457fe229a866dc9cb4a60a4b070ea3a73cacba27516fd30cee8',
     '5e9ca1c946deaf5458d2b6236145b225eee61ec6991b7df8ee96573b53d82584',
     'cfbadf76884ca661816f25487f6493826579afe257517ebd7d1fc2b0020eb289' ] }
```

## async wallet.send

Send payment to a receiving address. The transaction is signed locally using the
wallet's private key, and the raw transaction submitted to a remote API (without
revealing the wallet's secret).

Method signature:

```ts
/**
 * @param to The receiving address
 * @param amount The amount to transfer (in satoshi)
 * @return The raw transaction as hexadecimal string
 *
 */
public async send(
  to: string,
  amount: number,
  opts: ISendTxOptions = {},
): Promise<Insight.ISendRawTxResult>
```

Example:

```ts
const toAddress = "qZaTYNEimGLuqnBDpP3KvBKsFs3DbCuwnr"
const amount = 0.15 * 1e8 // 0.15 QTUM

const tx = await wallet.send(toAddress, amount)
console.log(tx)
```

Output:

```
{ txid: '40fec162e0d4e1377b5e6744eeba562408e22f60399be41e7ba24e1af37f773c' }
```

#### async wallet.send options

```ts
export interface ISendTxOptions {
  /**
   * Fee rate to pay for the raw transaction data (satoshi per byte). The
   * default value is the query result of current network's fee rate.
   */
  feeRate?: number
}
```

Setting tx fee rate manually:

```ts
const tx = await wallet.send(toAddress, amount, {
  // rate is 400 satoshi per byte, or  ~0.004 qtum/KB, as is typical.
  feeRate: 400,
})
```

## async wallet.generateTx

Generate and sign a payment transaction.

Method signature:

```ts
/**
 * @param to The receiving address
 * @param amount The amount to transfer (in satoshi)
 * @param opts
 *
 * @returns The raw transaction as hexadecimal string
 */
public async generateTx(
  to: string,
  amount: number,
  opts: ISendTxOptions = {},
): Promise<string>
```

Example:

```ts
const toAddress = "qZaTYNEimGLuqnBDpP3KvBKsFs3DbCuwnr"
const amount = 0.15 * 1e8

const rawtx = await wallet.generateTx(toAddress, amount)
console.log(rawtx)
```

Example output, the raw transaction as hexadecimal string:

```
0100000001a09a921ecb383b018b804fc1a274e6e1e67e30d4d0ee58f1085f59bc77c486ca010000006a47304402202fa6106aca6c682ab89b02ad62614462d1ec5e95cb8b4810ce793ad52a4002590220531cf380368cb8f92c7dd03ee375423073a14e5b7da6f48127c63cab17fbf2d7012103c12c73abaccf35b40454e7eb0c4b5760ce7a720d0cd2c9fb7f5423168aaeea03ffffffff02c0e1e400000000001976a914afb616c886f0efd9a9a486ccc07a09ab8d7a4bb288ac49b6ffe0010000001976a914c78300c58ab7c73e1767e3d550464d591ab0a12888ac00000000
```

You can decode the raw transaction using `qtum-cli`:

```
qtum-cli decoderawtransaction 0100000001a09a921ecb38...

{
  // ...
  "vout": [
    {
      "value": 0.15000000,
      "n": 0,
      "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 afb616c886f0efd9a9a486ccc07a09ab8d7a4bb2 OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a914afb616c886f0efd9a9a486ccc07a09ab8d7a4bb288ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
          "qZaTYNEimGLuqnBDpP3KvBKsFs3DbCuwnr"
        ]
      }
    },
    {
      "value": 80.69822025,
      "n": 1,
      "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 c78300c58ab7c73e1767e3d550464d591ab0a128 OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a914c78300c58ab7c73e1767e3d550464d591ab0a12888ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
          "qbkJZTKQfcout2joWVmnvUrJUDTg93bhdv"
        ]
      }
    }
  ]
}
```

There are two vouts:

1. pubkeyhash 0.15. This is the amount we want to send.
2. pubkeyhash 80.69822025. This is the amount we going back to the original owner as change.

## async wallet.contractSend

Create a send-to-contract transaction that invokes a contract's method.

```ts
/**
  * @param contractAddress Address of the contract in hexadecimal
  * @param encodedData The ABI encoded method call, and parameter values.
  * @param opts
  */
public async contractSend(
  contractAddress: string,
  encodedData: string,
  opts: IContractSendTXOptions = {},
): Promise<Insight.ISendRawTxResult>
```

Example:

Invoke the `burn()` method, and transfer 5000000 satoshi to the contract.

* The `burn()` method call ABI encodes to `e179b912`
* The 5000000 is `msg.value` in contract code.


```ts
const contractAddress = "1620cd3c24b29d424932ec30c5925f8c0a00941c"
// ABI encoded data for the send-to-method transaction
const encodedData = "e179b912"

// Invoke a contract's method, and transferring 0.05 to it.
const tx = await wallet.contractSend(contractAddress, encodedData, {
  amount: 0.05 * 1e8,
})

console.log(tx)
```

Output:

```
{ txid: 'd12ff9cfd76836d8eb5a39bc40f1dc5e6e2032bfa132f66cca638a7e76f2b6e7' }
```

## async wallet.generateContractSendTx

Generate a raw a send-to-contract transaction that invokes a contract's method.

Method signature:

```ts
/**
  * @param contractAddress
  * @param encodedData
  * @param opts
  */
public async generateContractSendTx(
  contractAddress: string,
  encodedData: string,
  opts: IContractSendTXOptions = {},
): Promise<string>
```

Example:

```ts
const contractAddress = "1620cd3c24b29d424932ec30c5925f8c0a00941c"
const encodedData = "e179b912"

const rawtx = await wallet.generateContractSendTx(contractAddress, encodedData, {
  amount: 0.01 * 1e8,
})

console.log(rawtx)
```

Example output:

```
0100000001e7b6f2767e8a63ca6cf632a1bf32206e5edcf140bc395aebd83668d7cff92fd1010000006b483045022100b86c4cbb2aecab44c951f99c0cbbf6115cf80881b39f33b4efd4d296892c1c15022062db1f681e684616e55303556577c9242102ff7a6815894dfb3090a7928fa13a012103c12c73abaccf35b40454e7eb0c4b5760ce7a720d0cd2c9fb7f5423168aaeea03ffffffff0240420f000000000022540390d003012804e179b912141620cd3c24b29d424932ec30c5925f8c0a00941cc2880256e0010000001976a914c78300c58ab7c73e1767e3d550464d591ab0a12888ac00000000
```

Decode the raw transaction:

```
qtum-cli decoderawtransaction 0100000001e7b6f2767e8a6...
```

Decoded Raw TX:

```ts
{
  // ...
  "vout": [
    {
      "value": 0.01000000,
      "n": 0,
      "scriptPubKey": {
        "asm": "4 250000 40 314145249 1620cd3c24b29d424932ec30c5925f8c0a00941c OP_CALL",
        "hex": "540390d003012804e179b912141620cd3c24b29d424932ec30c5925f8c0a00941cc2",
        "type": "call"
      }
    },
    {
      "value": 80.58700424,
      "n": 1,
      "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 c78300c58ab7c73e1767e3d550464d591ab0a128 OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a914c78300c58ab7c73e1767e3d550464d591ab0a12888ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
          "qbkJZTKQfcout2joWVmnvUrJUDTg93bhdv"
        ]
      }
    }
  ]
}
```

There are two vouts:

1. call 0.11. This is the amount we want to send to the contract.
2. pubkeyhash 80.58700424. This is the amount we going back to the original owner as change.

## async wallet.contractCall

Query a contract's method. It returns the result and logs of a simulated execution of the contract's code.

Method signature:

```ts
/**
 * @param contractAddress Address of the contract in hexadecimal
 * @param encodedData The ABI encoded method call, and parameter values.
 * @param opts
 */
public async contractCall(
  contractAddress: string,
  encodedData: string,
  opts: IContractSendTXOptions = {},
): Promise<Insight.IContractCall>
```

Example:

```ts
const contractAddress = "b10071ee33512ce8a0c06ecbc14a5f585a27a3e2"
const encodedData = "e179b912"

const result = await wallet.contractCall(contractAddress, encodedData, {
  amount: 0.01 * 1e8,
})

console.log(JSON.stringify(result, null, 2))
```

Output:

```ts
{
  "address": "b10071ee33512ce8a0c06ecbc14a5f585a27a3e2",
  "executionResult": {
    "gasUsed": 27754,
    "excepted": "None",
    "newAddress": "b10071ee33512ce8a0c06ecbc14a5f585a27a3e2",
    "output": "",
    "codeDeposit": 0,
    "gasRefunded": 0,
    "depositSize": 0,
    "gasForDeposit": 0
  },
  "transactionReceipt": {
    "stateRoot": "c04b98dbd1a38be8ecfb71e40072c90a1ee9f5961bb80fa6262f8a32979427bb",
    "gasUsed": 27754,
    "bloom": "000000000000000000002000400000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000
00000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    "log": [
      {
        "address": "b10071ee33512ce8a0c06ecbc14a5f585a27a3e2",
        "topics": [
          "9c31339612219a954bda4c790e4b182b6499bdf1464c392cb50e61d8afa1f9f2"
        ],
        "data": "000000000000000000000000ffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000"
      }
    ]
  }
}
```

## getTransactions

Get transactions about the wallet address.

Method signature:

```ts
/**
 * get transactions by wallet address
 * @param pageNum page number
 */
public async getTransactions(pageNum?: number): Promise<Insight.IRawTransactions>
```

Example:

```ts
const network = networks.testnet

const insight = network.insight()

const info = await insight.getTransactionInfo("f20914f3d810010c0a74df60abb3fcf0d3ff2669d944ce187f079ec9faec563e")
console.log(info)
```

Example output:

```ts
wallet address: qbkJZTKQfcout2joWVmnvUrJUDTg93bhdv

{ 
  pagesTotal: 4,
  txs: [
    {
      txid: 'f20914f3d810010c0a74df60abb3fcf0d3ff2669d944ce187f079ec9faec563e',
      version: 1,
      locktime: 0,
      isqrc20Transfer: false,
      vin: [Array],
      vout: [Array],
      blockhash: 'b993b80423233c4371c316e8d2eec6e0ea191efeb518fa3289f8ebce5cec8ab1',
      blockheight: 171321,
      confirmations: 2644,
      time: 1530852864,
      blocktime: 1530852864,
      valueOut: 19.991,
      size: 225,
      valueIn: 20,
      fees: 0.009 
    },
    // ...
  ]
}
```

## toEncryptedPrivateKey

encrypted wip using bip38.

Method signature:

```ts
/**
 * bip38 encrypted wip
 * @param passphrase
 */
public toEncryptedPrivateKey(passphrase: string = ""): string
```

Example:

```ts
const network = networks.testnet
const mnemonic = "hold struggle ready lonely august napkin enforce retire pipe where avoid drip"
const password = "covfefe"

const wallet = network.fromMnemonic(mnemonic, password)

console.log("public address:", wallet.address)
console.log("private key (WIF):", wallet.toWIF())
console.log("encrypted bip38 private key is:", wallet.toEncryptedPrivateKey(password))
```

Example output:

```ts
public address: qLUHmrFGexxpyHwQphLpE1czZNFE5m1xmV
private key (WIF): cNQKccYYQyGX9G9Qxq2DJev9jHygbZpb2UG7EvUapbtDx5XhkhYE
encrypted bip38 private key is: 6PYVKJXXQdWDyWuEbKfAhbArk41kLUk18jbYRANUhShKFfxhjLh6vh9G52
```

## fromEncryptedPrivateKey

`fromEncryptedPrivateKey` constructs a wallet from bip38 encrypted private key.

Method signature:

```ts
 /**
 * constructs a wallet from bip38 encrypted private key
 * @param encrypted private key string
 * @param passhprase password
 */
public fromEncryptedPrivateKey(
  encrypted: string,
  passhprase: string = "",
): Wallet
```

Example:

```ts
const network = networks.testnet
const encrypted = "6PYVKJXXQdWDyWuEbKfAhbArk41kLUk18jbYRANUhShKFfxhjLh6vh9G52"
const password = "covfefe"

const startAt = new Date().getTime()
const wallet = network.fromEncryptedPrivateKey(encrypted, password)
const endAt = new Date().getTime()

console.log("public address:", wallet.address)
console.log("private key (WIF):", wallet.toWIF())
console.log(`decryption takes ${(endAt - startAt) / 1000} seconds`)
```

Example output:

```ts
public address: qLUHmrFGexxpyHwQphLpE1czZNFE5m1xmV
private key (WIF): cNQKccYYQyGX9G9Qxq2DJev9jHygbZpb2UG7EvUapbtDx5XhkhYE
decryption takes 4.35 seconds
```