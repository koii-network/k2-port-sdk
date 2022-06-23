export interface PoRTInterface {
  trustedNodeAddress: string;
  node: number;
  namespaceId: string;
  nodes: Array<string>;
  walletLocation: string;
  trxRegex: string;
  ready: boolean;
  permissionGranted: boolean;
  ignoreRejection: boolean;
  connectionWait: boolean;
}
export interface InitParams {
  trustedNodeAddress: string;
  node: number;
  namespaceId: string;
  nodes: Array<string>;
  walletLocation: string;
  ignoreRejection: boolean;
  connectionWait: boolean;
  propagationCount: number;
}

export interface NodeInterface {
  data: NodeDataInterface;
  signature:string;
  owner:string;
}
export interface NodeDataInterface {
  url: string;
  timestamp: number;
}
