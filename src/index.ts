import fetch from "node-fetch";
import { PoRTInterface, InitParams, NodeInterface } from "./types";
import crypto from "crypto";
import { SignKeyPair, sign } from "tweetnacl";
import nacl from "tweetnacl";
import bs58 from "bs58";
import fs from "fs";
import { inspect } from "util";

/**
    @description This class is used to generate and submit Port data to the Port API.
**/
declare global {
  // eslint-disable-next-line
  interface Window {
    // eslint-disable-next-line
    koiiWallet: any;
  }
}
export class PoRT {
  /**
   * @param {Object} initParams Port class Init parameters
   * @param {String} initParams.trustedNodeAddress - URL to a trusted node
   * @param {Number} initParams.node - Number of nodes to send PoRT to
   * @param {string} initParams.walletLocation - key of wallet in local storage - Default to wallet
   * @param {boolean} initParams.connectionWait - Wait for Finne connection/rejection before sending anonymous PoRTs
   */
  trustedNodeAddress: string;
  propagationCount: number;
  namespaceId: string;
  nodes: Array<string>;
  walletLocation: string;
  ignoreRejection: boolean;
  connectionWait: boolean;
  initialized: Promise<void>;

  constructor(initParams: InitParams) {
    this.trustedNodeAddress =
      initParams.trustedNodeAddress || "https://mainnet.koii.live";
    this.propagationCount = initParams.propagationCount || 3;
    this.namespaceId = initParams.namespaceId || "Attention";
    this.walletLocation = initParams.walletLocation || "k2-wallet";
    this.ignoreRejection = initParams.ignoreRejection || false;
    this.connectionWait = initParams.connectionWait || false;
    this.initialized = this.initialize();
  }
  async initialize() {
    await this.getListOfAllNodes();
  }
  private async getListOfAllNodes() {
    fetch(this.trustedNodeAddress + "/nodes")
      .then((res) => res.json())
      .then(async (res) => {
        console.log(res);
        const validNodes = await this.getNodesRunningAttentionGame(res);
        this.nodes = validNodes;
      })
      .catch((e) => {
        this.nodes = [];
        console.error(e);
        // this.nodes.push(this.trustedNodeAddress);
      });
  }

  /**
   *
   * @description This function check that which KOII nodes are running Attention Game
   * @param {Array} nodes - List of nodes to check for attention game
   * @returns {Array} - List of nodes running attention game.
   */
  private async getNodesRunningAttentionGame(nodes: Array<NodeInterface>) {
    const nodesRunningAttentionGame: Array<string> = [];
    for (let i = 0; i < nodes.length; i++) {
      const response: boolean = await this.checkNodeAttentionGame(
        nodes[i]["data"]["url"]
      );
      if (response) nodesRunningAttentionGame.push(nodes[i]["data"]["url"]);
    }
    return nodesRunningAttentionGame;
  }
  checkNodeAttentionGame(node: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fetch(`${node}/attention`)
        .then((res) => {
          if (res.status !== 200) return resolve(false);
          return resolve(true);
        })
        .catch((e) => {
          console.log(e);
          return resolve(false);
        });
    });
  }
  private async getHeaders(trxId: string) {
    let headers = [];
    if (window.koiiWallet) {
      const response = await window.koiiWallet.signPort(trxId);
      headers = response.data;
      console.log(`%c ${JSON.stringify(response)}`, "color: green");
      if (response.status == 200) return response.data;
    }
    if (
      localStorage.getItem(this.walletLocation) ||
      localStorage.getItem("portWallet")
    ) {
      const wallet: Uint8Array | null = JSON.parse(
        localStorage.getItem(this.walletLocation) as string
      );
      headers = await this.generatePoRTHeaders(wallet, trxId);
      return headers;
    } else {
      try {
        let wallet = await arweave.wallets.generate();
        localStorage.setItem("portWallet", JSON.stringify(wallet));
        headers = await this.#generatePoRTHeaders(wallet, trxId);
        return headers;
      } catch (e) {
        console.log(e);
      }
    }
  }
  private async generatePoRTHeaders(walletKeys, payload) {
    console.log("In header generation");
    // eslint-disable-next-line no-unused-vars
    const wallet = await koi.loadWallet(walletKeys);
    // console.log(walletKeys)
    //eslint-disable-next-line no-unused-vars
    const address = await koi.getWalletAddress();
    console.log(address);
    let headers = {};
    try {
      let signPayload = await this.#proofOfWork({
        data: {
          payload,
          timeStamp: Math.floor(+new Date() / 1000),
        },
      });
      headers["x-request-signature"] = JSON.stringify({
        data: signPayload["data"],
        signature: signPayload["signature"],
      });
      headers["request-public-key"] = signPayload.owner;
      return headers;
    } catch (e) {
      console.log(e);
      throw {
        name: "Generic Error",
        description: "Something went wrong while generating headers",
      };
    }
  }
  async #proofOfWork(payload) {
    let nonce = 0;
    const loopCondition = true;
    let signedPayload = {};
    while (loopCondition) {
      payload.data.nonce = nonce;
      signedPayload = await koi.signPayload(payload);
      const  e = crypto
        .createHash("sha256")
        .update(JSON.stringify(signedPayload.signature))
        .digest("hex");
      if (this.difficultyFunction(e)) {
        console.log(e);
        break;
      }
      nonce++;
    }
    return signedPayload;
  }
  difficultyFunction(hash) {
    return hash.startsWith("00") || hash.startsWith("01");
  }
  async signPayload(resourceId, Wallet) {
    let nonce = 0;
    // TODO: change epoch:-1 to current epoch
    const payload = {
      resource: resourceId,
      timestamp: new Date().valueOf(),
      nonce,
      scheme: "AR",
      epoch: -1,
    };
    let signedMessage: Uint8Array = new Uint8Array();
    let data = {};
    // eslint-disable-next-line
    while (true) {
      const msg= new TextEncoder().encode(JSON.stringify(payload));
      payload.nonce++;
      signedMessage = nacl.sign(msg, secretKey);
      const hash = crypto
        .createHash("sha256")
        .update(encodePublicKey(signedMessage))
        .digest("hex");
      // console.log(hash);
      if (hash.startsWith("00")) {
        console.log(hash);
        break;
      }
      nonce++;
    }
    data = {
      signedMessage: encodePublicKey(signedMessage),
      publicKey: encodePublicKey(publicKey),
    };
    // const hash = crypto.createHash("sha256").update(pwd).digest("base64");

    console.log(encodePublicKey(signedMessage));
    // console.log(decodePublicKey(encodePublicKey(signedMessage)))
    jsonfile.writeFileSync("./ports.json", data);
    fetch("http://localhost:8887/attention/submit-ports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Done");
      });
  }
}

function encodePublicKey(publicKey) {
  return bs58.encode(
    Buffer.from(publicKey.buffer, publicKey.byteOffset, publicKey.byteLength)
  );
}
function decodePublicKey(publicKey) {
  return new Uint8Array(bs58.decode(publicKey));
}
