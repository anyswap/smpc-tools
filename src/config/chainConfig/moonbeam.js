import { getLocalRPC } from "./methods";
import { VERSION, USE_VERSION } from "../constant";
import { ChainId } from "./chainId";

export const GLMR_MAIN_CHAINID = ChainId.GLMR;
export const GLMR_MAINNET = getLocalRPC(
  GLMR_MAIN_CHAINID,
  "https://rpc.api.moonbeam.network"
);
export const GLMR_MAIN_EXPLORER = "https://moonscan.io";

const symbol = "GLMR";

const bridgeToken = {
  [VERSION.V1]: {
    bridgeInitToken: "",
    bridgeInitChain: "",
  },
  [VERSION.V5]: {
    bridgeInitToken: "",
    bridgeInitChain: "1",
    nativeToken: "",
    crossBridgeInitToken: "",
  },
  [VERSION.V7]: {
    bridgeInitToken: "",
    bridgeInitChain: "1",
    nativeToken: "",
    crossBridgeInitToken: "",
  },
};

export default {
  [GLMR_MAIN_CHAINID]: {
    ...bridgeToken[USE_VERSION],
    swapRouterToken: "",
    multicalToken: "0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C",
    v1FactoryToken: "",
    v2FactoryToken: "",
    nodeRpc: GLMR_MAINNET,
    nodeRpcList: [GLMR_MAINNET],
    chainID: GLMR_MAIN_CHAINID,
    lookHash: GLMR_MAIN_EXPLORER + "/tx/",
    lookAddr: GLMR_MAIN_EXPLORER + "/address/",
    lookBlock: GLMR_MAIN_EXPLORER + "/block/",
    explorer: GLMR_MAIN_EXPLORER,
    symbol: symbol,
    name: "Moonbeam",
    networkName: "Moonbeam mainnet",
    type: "main",
    label: GLMR_MAIN_CHAINID,
  },
};
