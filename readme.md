# KOII Proof of Real traffic(PoRTs)
## What is KOII PoRT:
KOII port is a way to track the attention that assets on KOII network gets and to earn rewards based on that attention
## Introduction:

This package will sign proofs of real traffic via Finnie wallet and submit to KOII Nodes and in returns your user can earn some KOII as a token of appreciation for sharing content hosted on KOII network.

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

**Replace {{Version}} with a correct version from release`**

**Note:CDN Coming soon!!**

## SDK Documentation

First you have to initialize the PoRT class:

```js
port = new PoRT({
  trustedNodeAddress: 'https://mainnet.koii.live', //Address of KOII mainnet
  node: 5, //maximum number of nodes to send PoRTs to.
  connectionWait: true, // this parameters waits for Finne to be connected
});
```

Now here's the list of function this SDK exposes:

<!-- ### **`ConnectWallet()`**
This function is optional. It attempts to connect to Finne wallet and get permissions to Sign PoRTs you can also use `koiiWallet.connect()` instead of this this function.

##### Arguments

This function accepts an optional options object which for now includes following options.

**`ignoreRejection`** <br />
**Type**: `Boolean` <br />
**description**: On `connectWallet()` when Finne is rejected it saves the rejection status in `localStorage` and next time you call connect if the `rejectedStatus` is `true` it will not connect instead fallback to **anonymous** PoRT submission. So provide this flag as `true` if you want to override this rejection status.
 <br /> -->
### **`PropagatePoRT()`** <br />
This function is the core of this SDK. It attempts to send **Proofs of Real Traffic** to KOII network for given transaction Id. First it tries Finne wallet and if permissions are available to SignPoRTs it will sign PoRTs else it will generate a new Koii wallet in and store it in your browser and Sign PoRTs with them.
 <br />
##### Arguments

This function accepts following arguments
**`trxId`** <br />
**Type**: `String` <br />
**Required**: `true` <br />
**description**: This must be a valid Arweave transaction Id for which you want to send Proofs

### **`ClearFinneRejection()`** <br />
On `connectWallet()` when Finne is rejected it saves the rejection status in `localStorage` and next time you call connect if the `rejectedStatus` is `true` it will not connect to Finne instead fallback to **anonymous** PoRT submission. So to reset the rejection status use this function.
 <br />
## Example

```js
portAPI = new port.PoRT({
  trustedNodeAddress: 'https://mainnet.koii.live',
  node: 5,
  connectionWait: false,
});

// portAPI.connectWallet()
portAPI.propagatePoRT('TI6x7I6wzh2VQhT5qXEFRWQxX2zAj8zGdcadCYn8580')
```
