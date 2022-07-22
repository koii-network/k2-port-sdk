import { InitParams, NodeInterface, PoRTData } from "./types";
import nacl, { BoxKeyPair } from "tweetnacl";
import bs58 from "bs58";
import { sha256 } from "js-sha256";
import { ChunkGraph } from "webpack";

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

  constructor(initParams: InitParams = {}) {
    this.trustedNodeAddress =
      initParams.trustedNodeAddress || "https://k2-task-testnet.koii.live/";
    console.log(this);
    this.propagationCount = initParams.propagationCount || 3;
    this.namespaceId = initParams.namespaceId || "Attention";
    this.walletLocation = initParams.walletLocation || "k2-wallet";
    this.ignoreRejection = initParams.ignoreRejection || false;
    this.connectionWait = initParams.connectionWait || false;
    this.initialized = this.initialize();
    // console.log(this.initialized);
    this.nodes = [];
  }
  initialize() {
    return this.getListOfAllNodes();
  }

  private getListOfAllNodes(): Promise<void> {
    return new Promise((resolve, reject) => {
      fetch(this.trustedNodeAddress + "/nodes")
        .then((res) => res.json())
        .then(async (res) => {
          const validNodes = await this.getNodesRunningAttentionGame(res);
          this.nodes = validNodes;
          resolve();
          // v =validNodes
        })
        .catch((e) => {
          this.nodes = [];
          console.error(e);
          // this.nodes.push(this.trustedNodeAddress);
        });
    });
  }

  /**
   *
   * @description This function check that which KOII nodes are running Attention Game
   * @param {Array} nodes - List of nodes to check for attention game
   * @returns {Array} - List of nodes running attention game.
   */
  /**
   *
   * @description This function submits PoRT to KOII network for given transaction ID
   * @param {Array} trxId - Transaction Id for which tom send PoRT of.
   */
  async propagatePoRT(trxId) {
    await this.initialize;
    // if (!this.trxRegex.test(trxId))
    //   return {
    //     status: 400,
    //     message: 'Invalid TransactionId',
    //   };
    // if (this.connectionWait)
    //   try {
    //     await this.#listenForPermissions();
    //   } catch (e) {
    //     console.log(e);
    //   }
    // try {
    //   await this.#checkReadyState();
    // } catch (e) {
    //   return { status: 401, message: 'Koi-PoRT failed to initialize' };
    // }
    let headers = {};
    // headers['x-request-signature'] = JSON.parse(headers['x-request-signature']);
    headers = await this.signPort(trxId);
    try {
      2;
    } catch (e) {
      headers = {};
      console.log(e);
    }
    if (headers) {
      for (let i = 0; i < this.nodes.length; i++) {
        fetch(this.nodes[i] + `/attention/submit-ports`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(headers),
        })
          .then((res) => res.json())
          .then(console.log)
          .catch(console.log);

        // console.log(headers);
      }
    }
  }
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
  async signPort(trxId: string) {
    await this.initialized;
    let Ports: PoRTData;
    if (window && window.koiiWallet && window.koiiWallet.signK2Port) {
      //TODO: Change this when we have ports are implemented in finnie
      const response = await window.koiiWallet.signPort(trxId);
      Ports = response.data;
      console.log(`%c ${JSON.stringify(response)}`, "color: green");
      if (response.status == 200) return response.data;
    }
    if (localStorage.getItem(this.walletLocation)) {
      
      
      // console.log({
      //   wallet: JSON.parse(localStorage.getItem(this.walletLocation)),
      // });
      const wallet: BoxKeyPair = nacl.sign.keyPair.fromSecretKey(
        new Uint8Array(
          JSON.parse(localStorage.getItem(this.walletLocation) as string)
        )
      );
      Ports = await this.generatePoRTHeaders(wallet, trxId);
      return Ports;
    } else {
      try {
        const wallet: BoxKeyPair = nacl.sign.keyPair();
        localStorage.setItem(
          this.walletLocation,
          JSON.stringify(Array.from(wallet.secretKey))
        );
        Ports = await this.generatePoRTHeaders(wallet, trxId);
        return Ports;
      } catch (e) {
        console.log(e);
      }
    }
  }
  private async generatePoRTHeaders(
    wallet: BoxKeyPair,
    contentId: string
  ): Promise<PoRTData> {
    try {
      console.log("In header generation");
      let nonce = 0;
      // TODO: change epoch:-1 to current epoch
      const payload = {
        resource: contentId,
        timestamp: new Date().valueOf(),
        nonce,
        scheme: "AR",
        epoch: -1,
      };
      let signedMessage: Uint8Array = new Uint8Array();
      for (;;) {
        const msg: Uint8Array = new TextEncoder().encode(
          JSON.stringify(payload)
        );
        payload.nonce++;
        signedMessage = nacl.sign(msg, wallet.secretKey);
        const hash = sha256(encodePublicKey(signedMessage));
        // console.log(hash);
        if (this.difficultyFunction(hash)) {
          break;
        }
        nonce++;
      }
      const data = {
        signedMessage: encodePublicKey(signedMessage),
        publicKey: encodePublicKey(wallet.publicKey),
      };
      // console.log(data);
      return data;
    } catch (e) {
      console.log(e);
      throw {
        name: "Generic Error",
        description: "Something went wrong while generating headers",
      };
    }
  }

  difficultyFunction(hash: string) {
    return hash.startsWith("00") 
  }
}

function encodePublicKey(publicKey) {
  return bs58.encode(
    publicKey
  );
}
function decodePublicKey(publicKey) {
  return new Uint8Array(bs58.decode(publicKey));
}
