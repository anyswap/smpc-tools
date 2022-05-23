import { useActiveWeb3React } from "@/hooks";
import { useCallback, useMemo } from "react";

import { ethers } from "_ethers@5.6.4@ethers";

import web3 from "@/assets/js/web3";

// const Tx = require("ethereumjs-tx");
import Tx from "ethereumjs-tx";
// console.log(Tx)
export enum WrapType {
  NOT_APPLICABLE,
  WRAP,
  UNWRAP,
  NOCONNECT,
}

const CHAINID = "30400";

const NOCONNECT = { wrapType: WrapType.NOCONNECT };

export function eNodeCut(enode: any) {
  const obj = {
    key: "",
    ip: "",
    enode: "",
  };
  if (!enode || enode.indexOf("enode://") === -1 || enode.indexOf("@") === -1)
    return obj;
  const enodeObj: any = enode.match(/enode:\/\/(\S*)@/);
  const ip = enode.match(/@(\S*)/)[1];
  // console.log(enodeObj)
  // console.log(ip)
  return {
    key: enodeObj[1],
    ip: ip,
    enode: enodeObj.input,
  };
}

let mmWeb3: any;
if (
  typeof window.ethereum !== "undefined" ||
  typeof window.web3 !== "undefined"
) {
  // Web3 browser user detected. You can now use the provider.
  mmWeb3 = window["ethereum"] || window?.web3?.currentProvider;
}

export function useSign(): any {
  const { account, library } = useActiveWeb3React();
  const signMessage = useCallback(
    (hash: any) => {
      return new Promise((resolve) => {
        const params = [account, hash];
        const method = "eth_sign";
        console.log(params);
        if (library) {
          library
            .send(method, params)
            .then((res: any) => {
              console.log(res);
              // return result;
              const rsv = res.indexOf("0x") === 0 ? res.replace("0x", "") : res;
              let v = parseInt("0x" + rsv.substr(128));
              v = Number(CHAINID) * 2 + 35 + Number(v) - 27;
              const result = {
                rsv: res.result,
                r: rsv.substr(0, 64),
                s: rsv.substr(64, 64),
                // v: Number(v) - 27 === 0 ? "00" : "01",
                v: web3.utils.toHex(v).replace("0x", ""),
              };
              resolve(result);
            })
            .catch((error: any) => {
              console.error("Could not sign", error);
              resolve("");
            });
        } else {
          resolve("");
        }
        // if (mmWeb3) {

        //   mmWeb3.sendAsync({
        //     method,
        //     params,
        //     // from,
        //   }, (err:any, res:any) => {
        //     console.log(res)
        //     if (!err) {
        //       const rsv = res.result.indexOf("0x") === 0 ? res.result.replace("0x", "") : res.result;
        //       const v = parseInt("0x" + rsv.substr(128))
        //       const result = {
        //         rsv: res.result,
        //         r: rsv.substr(0, 64),
        //         s: rsv.substr(64, 64),
        //         v: (Number(v) - 27 === 0 ? "00" : "01"),
        //       }
        //       resolve(result)
        //     } else {
        //       resolve('')
        //     }
        //   })
        // }
      });
    },
    [library]
  );
  return {
    signMessage,
  };
}

export function useSignEnode(enode: string | undefined): {
  execute?: undefined | (() => Promise<any>);
} {
  const { account, library } = useActiveWeb3React();
  const { signMessage } = useSign();
  return useMemo(() => {
    if (!enode || !library) return {};
    return {
      execute: async () => {
        const eNodeKey = eNodeCut(enode).key;
        // const provider = new ethers.providers.Web3Provider(library.provider);
        // const signer = provider.getSigner();
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(eNodeKey));
        // const hash = ethers.utils.keccak256('0x' + (eNodeKey))
        // const hash = ethers.utils.hashMessage(eNodeKey)
        // const hash = eNodeKey;
        // const result = await signer.signMessage(eNodeKey);
        // const result = await signer.signMessage(hash);
        const result = await signMessage(hash);
        // console.log(signer)
        console.log(result);
        console.log(hash);
        // console.log(ethers.utils.toUtf8Bytes(eNodeKey))

        const rsvFormat = "0x" + result.r + result.s + result.v;
        return rsvFormat;
      },
    };
  }, [enode, library, account]);
}

export function useCreateGroup(
  rpc: string | undefined,
  mode: string | undefined,
  nodeArr: Array<string>
): {
  execute?: undefined | (() => Promise<any>);
} {
  return useMemo(() => {
    if (!mode || nodeArr.length <= 0 || !rpc) return {};
    return {
      execute: async () => {
        web3.setProvider(rpc);
        const result = await web3.smpc.createGroup(mode, nodeArr);
        let cbData = result;
        if (result && typeof result === "string") {
          cbData = JSON.parse(cbData);
        }
        let data = {};
        if (cbData.Status !== "Error") {
          data = { msg: "Success", info: cbData.Data };
        } else {
          data = { msg: "Error", error: cbData.Tip };
        }
        return data;
      },
    };
  }, [mode, nodeArr, rpc]);
}

export function useReqSmpcAddress(
  rpc: string | undefined,
  gID: string | undefined,
  ThresHold: string | undefined,
  Sigs: string | undefined
): {
  execute?: undefined | (() => Promise<any>);
} {
  const { account, library } = useActiveWeb3React();
  const { signMessage } = useSign();
  return useMemo(() => {
    // if (!library || !account || !gID || !ThresHold || !Sigs) return {};
    if (!library || !account || !gID || !ThresHold) return {};
    return {
      execute: async () => {
        // const provider = new ethers.providers.Web3Provider(library.provider);
        // const signer = provider.getSigner();
        // web3.setProvider('http://47.114.115.33:5913/')
        web3.setProvider(rpc);
        const nonceResult = await web3.smpc.getReqAddrNonce(account);
        let nonce = 0;
        if (nonceResult.Status !== "Error") {
          nonce = nonceResult.Data.result;
        }
        const data = {
          TxType: "REQSMPCADDR",
          GroupId: gID,
          ThresHold: ThresHold,
          Mode: "0",
          TimeStamp: Date.now().toString(),
          Sigs: Sigs,
          keytype: "ED25519",
        };
        const rawTx: any = {
          from: account,
          value: "0x0",
          chainId: web3.utils.toHex(CHAINID),

          // gas: '0x0',
          // gasPrice: "0x0",
          nonce: nonce,
          // nonce: "0x0",
          data: JSON.stringify(data),
        };
        console.log(rawTx);
        const tx = new Tx(rawTx);
        // const hash = "0x" + tx.hash().toString("hex");
        let hash = Buffer.from(tx.hash(false)).toString("hex");
        hash = hash.indexOf("0x") === 0 ? hash : "0x" + hash;
        console.log(hash);
        const result = await signMessage(hash);
        rawTx.r = "0x" + result.r;
        rawTx.s = "0x" + result.s;
        rawTx.v = "0x" + result.v;
        const tx1 = new Tx(rawTx);
        console.log(rawTx);
        console.log(tx1);
        let signTx = tx1.serialize().toString("hex");
        signTx = signTx.indexOf("0x") === 0 ? signTx : "0x" + signTx;
        let cbData = await web3.smpc.reqSmpcAddr(signTx);
        let resultData: any = {};
        if (cbData && typeof cbData === "string") {
          cbData = JSON.parse(cbData);
        }
        if (cbData.Status !== "Error") {
          resultData = { msg: "Success", info: cbData.Data.result };
        } else {
          resultData = { msg: "Error", error: cbData.Tip };
        }
        console.log(signTx);
        console.log(resultData);
        console.log(result);
        return resultData;
      },
    };
  }, [account, library, gID, ThresHold, Sigs]);
}
