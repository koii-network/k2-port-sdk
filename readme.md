# KOII Proof of Real traffic(PoRTs)
## What is Proof of Real Traffic:
Proof of Real Traffic is a cryptographic primitive including a signature from a specific consumer wallet. Each viewer creates a signature and then hashes over it to find a PoRT with a specific [difficulty factor](https://btc.com/stats/diff) generating a PoW which represents the content and viewer uniquely. 

## Introduction:

This package will sign proofs of real traffic via Finnie wallet and submit to Koii Task Nodes and in returns your user can earn some KOII as a token of appreciation for sharing content hosted on Koii Network.

## How to use:

Following is the installation guide for KOII PoRT

`npm install @_koii/k2-port`
or
`yarn add @_koii/k2-port`

Or else you can get a binary from our CDN

Then in your `index.html` file add
`<script src="./node_modules/@_koii/k2-port/bundle/port.js"></script>`

or 
`<script src="https://cdn.koii.live/port-latest.js"></script>`

## SDK Documentation

First you have to initialize the PoRT class:

```js
import * as port from "@_koii/k2-port"

let portAPI = new port.PoRT({
  trustedNodeAddress: 'https://k2-tasknet.koii.live', //Address of KOII mainnet
  node: 5, //maximum number of nodes to send PoRTs to.
  connectionWait: true, // this parameters waits for Finne to be connected
});
```

Now here's the list of function this SDK exposes:

### **`PropagatePoRT()`** <br />
This function is the core of this SDK. It attempts to send **Proofs of Real Traffic** to Koii network for given Id. Id could be your NFT id, wallet public key, CID from IPFS and your website url. First it tries Finne wallet and if permissions are available to SignPoRTs it will sign PoRTs else it will generate a new Koii wallet in and store it in your browser and Sign PoRTs with them.
 <br />
##### Arguments

This function accepts following arguments
**`trxId`** <br />
**Type**: `String` <br />
**Required**: `true` <br />
**description**: This must be a valid  Id for which you want to send Proofs

### **`ClearFinneRejection()`** <br />
On `connectWallet()` when Finne is rejected it saves the rejection status in `localStorage` and next time you call connect if the `rejectedStatus` is `true` it will not connect to Finne instead fallback to **anonymous** PoRT submission. So to reset the rejection status use this function.
 <br />
## Example
For your **NFT id** on Arweave:
```js
import * as port from "@_koii/k2-port"

let portAPI = new port.PoRT({
  trustedNodeAddress: 'https://k2-tasknet.koii.live', //Address of KOII mainnet
  node: 5, //maximum number of nodes to send PoRTs to.
  connectionWait: true, // this parameters waits for Finne to be connected
});

//portAPI.propagatePoRT('TI6x7I6wzh2VQhT5qXEFRWQxX2zAj8zGdcadCYn8580')
portAPI.propagatePoRT('<Your NFT id on Arweave>') // NFT id on Arweave
```

For your **Wallet Address**:
```js
import * as port from "@_koii/k2-port"

let portAPI = new port.PoRT({
  trustedNodeAddress: 'https://k2-tasknet.koii.live', //Address of KOII mainnet
  node: 5, //maximum number of nodes to send PoRTs to.
  connectionWait: true, // this parameters waits for Finne to be connected
});

//portAPI.propagatePoRT('rxTOQUOzS5gzYX6mWsbwhuiGFurdXsJR0w2_Xozye1M')
portAPI.propagatePoRT('<Your wallet public key>') // wallet address
```

For your **Website**:
```js
import * as port from "@_koii/k2-port"

let portAPI = new port.PoRT({
  trustedNodeAddress: 'https://k2-tasknet.koii.live', //Address of KOII mainnet
  node: 5, //maximum number of nodes to send PoRTs to.
  connectionWait: true, // this parameters waits for Finne to be connected
});

// portAPI.propagatePoRT('https://www.koii.network/')
portAPI.propagatePoRT('<Your website url>') // Your webiste url
```

For your **CID from IPFS**:
```js
import * as port from "@_koii/k2-port"

let portAPI = new port.PoRT({
  trustedNodeAddress: 'https://k2-tasknet.koii.live', //Address of KOII mainnet
  node: 5, //maximum number of nodes to send PoRTs to.
  connectionWait: true, // this parameters waits for Finne to be connected
});

// portAPI.propagatePoRT('bafybeiae5xyoekitp23qiuedcxzjtakh2a2dky5aieajp7qsnwdanvqjri')
portAPI.propagatePoRT('<Your content CID>') // Your content CID
