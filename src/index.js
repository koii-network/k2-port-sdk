console.log("hello world from port")
const fetch = require('node-fetch');
const tools = require('@_koi/sdk/web');
const koi = new tools.Web();

const crypto = require('crypto');
const { arweave } = require('@_koi/sdk/common');

/**
    @description This class is used to generate and submit Port data to the Port API.
**/
export class PoRT {
  /**
   * @param {Object} initParams Port class Init parameters
   * @param {String} initParams.trustedNodeAddress - URL to a trusted node
   * @param {Number} initParams.node - Number of nodes to send PoRT to
   * @param {string} initParams.walletLocation - key of wallet in local storage - Default to wallet
   * @param {boolean} initParams.connectionWait - Wait for Finne connection/rejection before sending anonymous PoRTs
   */
  constructor(initParams) {
    if (PoRT.instance) return PoRT.instance;
    this.trustedNodeAddress = initParams.trustedNodeAddress;
    this.node = initParams.node||3;
    this.namespaceId = '2Nnv83I7BLj_Ca97hPMOmVmLxvufzgxyt9G8fo_hNqQ';
    this.nodes = [];
    this.#getListOfAllNodes();
    this.walletLocation = initParams.walletLocation || 'koi-keyAr';
    this.trxRegex = /^\/?([a-zA-Z0-9-_]{43})\/?$|^\/?([a-zA-Z0-9-_]{43})\/(.*)$/i;
    this.ready = false;
    this.permissionsGranted = '';
    this.ignoreRejection = false;
    this.connectionWait = initParams.connectionWait || false;
  }
  /**
   *
   * @description This function get the list of all available bundler nodes from trusted node
   * @returns {void} If can slash
   */
  #getListOfAllNodes() {
    fetch(this.trustedNodeAddress + '/nodes')
      .then((res) => res.json())
      .then(async (res) => {
        console.log(res);
        const validNodes = await this.#getNodesRunningAttentionGame(res);
        this.nodes = validNodes;
        this.ready = true;
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
  async #getNodesRunningAttentionGame(nodes) {
    let nodesRunningAttentionGame = [];
    for (let i = 0; i < nodes.length; i++) {
      let response = await this.#checkNodeAttentionGame(nodes[i]['data']['url']);
      if (response) nodesRunningAttentionGame.push(nodes[i]['data']['url']);
    }
    return nodesRunningAttentionGame;
  }
  connectWallet(params) {
    this.manualConnect = true;
    return new Promise((resolve, reject) => {
      let rejectionStatus = localStorage.getItem('finneRejected') || false;
      if (!rejectionStatus || (params && params.ignoreRejection)) {
        let finneInterval = setInterval(() => {
          if (window.koiiWallet) {
            window.koiiWallet.connect().then((res) => {
              if (res.status === 200) {
                this.permissionsGranted = 'granted';
                localStorage.setItem('finneRejected', false);
                return resolve();
              } else {
                this.permissionsGranted = 'rejected';
                clearInterval(finneInterval);
                localStorage.setItem('finneRejected', true);
                return reject('Rejected');
              }
            });
            clearInterval(finneInterval);
          }
        }, 1000);
      } else {
        this.permissionsGranted = 'rejected';
        return reject('Rejected');
      }
    });
  }

  /**
   *
   * @description This function listens for Finne permissions for this site
   * @returns {Promise} - Resolves when permissions are granted
   */
  #listenForPermissions() {
    return new Promise((resolve, reject) => {
      let finneInterval = setInterval(() => {
        if (window.koiiWallet) {
          window.koiiWallet
            .getPermissions()
            .then((res) => {
              if (res.status === 200) {
                resolve();
                return clearInterval(finneInterval);
              } else {
                if (this.permissionsGranted == 'rejected') {
                  clearInterval(finneInterval);
                  return reject();
                }
              }
            })
            .catch((e) => {
              console.log(e);
            });
        } else {
        }
      }, 1000);
    });
  }
  /**
   *
   * @description This function makes sure that nodes URLs are cached. before sending PoRT
   * @returns {Promise} -Promise is resolved when poRT state is ready
   */
  #checkReadyState() {
    return new Promise((resolve, reject) => {
      let readyStateListener = setInterval(() => {
        if (this.ready) {
          resolve();
          clearInterval(readyStateListener);
        }
      }, 100);
    });
  }
  /**
   *
   * @description This function check that which KOII node are running Attention Game
   * @param {Array} node - Node URL to check for attention game
   * @returns {Promise} - Resolves true if attention game is running on that node.
   */
  #checkNodeAttentionGame(node) {
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

  /**
   * @description This function generates PoRTs.First it tries Finne, if Finne is rejected then it falls back to anonymous identity PoRts generation
   * @param {Array} trxId - Transaction Id for which tom send PoRT of.
   */

  async #getHeaders(trxId) {
    let headers = [];
    if (window.koiWallet) {
      const response = await koiWallet.signPort(trxId);
      headers = response.data;
      console.log(`%c ${JSON.stringify(response)}`, 'color: green');
      if (response.status == 200) return response.data;
    }
    if (localStorage.getItem(this.walletLocation) || localStorage.getItem('portWallet')) {
      let wallet = JSON.parse(localStorage.getItem(this.walletLocation) || localStorage.getItem('portWallet'));
      headers = await this.#generatePoRTHeaders(wallet, trxId);
      return headers;
    } else {
      try {
        let wallet = await arweave.wallets.generate();
        localStorage.setItem('portWallet', JSON.stringify(wallet));
        headers = await this.#generatePoRTHeaders(wallet, trxId);
        return headers;
      } catch (e) {
        console.log(e);
      }
    }
  }
    /**
   *
   * @description reset Finne Rejection
   */
  async clearFinneRejection() {
    try {
      localStorage.setItem('finneRejected', false);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   *
   * @description This function submits PoRT to KOII network for given transaction ID
   * @param {Array} trxId - Transaction Id for which tom send PoRT of.
   */
  async propagatePoRT(trxId) {
    if (!this.trxRegex.test(trxId))
      return {
        status: 400,
        message: 'Invalid TransactionId',
      };
    if (this.connectionWait)
      try {
        await this.#listenForPermissions();
      } catch (e) {
        console.log(e);
      }
    try {
      await this.#checkReadyState();
    } catch (e) {
      return { status: 401, message: 'Koi-PoRT failed to initialize' };
    }
    let headers = {};
    // headers['x-request-signature'] = JSON.parse(headers['x-request-signature']);
    try {
      headers = await this.#getHeaders(trxId);
    } catch (e) {
      headers = null;
    }
    if (headers) {
      for (let i = 0; i < this.nodes.length; i++) {
        console.log(this.nodes[i] + '/submit-port');
        fetch(this.nodes[i] + `/attention/submit-port`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
  /**
   * @description This method Will return signed header and public header for KOI attention traffic
   * @param {string} resoureId -   The resourse Id will be TrxId of the resource
   */
  async #generatePoRTHeaders(walletKeys, payload) {
    console.log('In header generation');
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
      headers['x-request-signature'] = JSON.stringify({
        data: signPayload['data'],
        signature: signPayload['signature'],
      });
      headers['request-public-key'] = signPayload.owner;
      return headers;
    } catch (e) {
      console.log(e);
      throw new {
        name: 'Generic Error',
        description: 'Something went worng while generaing headers',
      }();
    }
  }
  async #proofOfWork(payload) {
    let nonce = 0;
    const loopCondition = true;
    let signedPayload = {};
    while (loopCondition) {
      payload.data.nonce = nonce;
      signedPayload = await koi.signPayload(payload);
      let e = crypto.createHash('sha256').update(JSON.stringify(signedPayload.signature)).digest('hex');
      if (this.#difficultyFunction(e)) {
        console.log(e);
        break;
      }
      nonce++;
    }
    return signedPayload;
  }
  #difficultyFunction(hash) {
    return hash.startsWith('00') || hash.startsWith('01');
  }
}
