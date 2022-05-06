import { useActiveWeb3React } from "@/hooks";
import { useMemo } from "react";

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

// export function useSign(parsms: any): {
//   execute?: undefined | (() => Promise<void>);
//   wrapType?: WrapType;
// } {
//   const { account, library } = useActiveWeb3React();
//   return useMemo(() => {
//     if (!library) return NOCONNECT;
//     return {
//       wrapType: WrapType.WRAP,
//       execute: async () => {
//         library
//           .send("eth_sign", parsms)
//           .then((result: any) => {
//             return result;
//           })
//           .catch((error: any) => {
//             console.error("Could not sign", error);
//           });
//       },
//     };
//   }, [library]);
// }

export function useSignEnode(enode: string | undefined): {
  execute?: undefined | (() => Promise<any>);
} {
  const { account, library } = useActiveWeb3React();
  return useMemo(() => {
    if (!enode || !library) return {};
    return {
      execute: async () => {
        const eNodeKey = eNodeCut(enode).key;
        const provider = new ethers.providers.Web3Provider(library.provider);
        const signer = provider.getSigner();
        // const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(eNodeKey))
        // const hash = ethers.utils.keccak256('0x' + (eNodeKey))
        // const hash = ethers.utils.hashMessage(eNodeKey)
        const hash = eNodeKey;
        // const result = await signer.signMessage(eNodeKey);
        const result = await signer.signMessage(hash);
        // console.log(signer)
        console.log(result);
        console.log(hash);
        // console.log(ethers.utils.toUtf8Bytes(eNodeKey))
        const rsv =
          result.indexOf("0x") === 0 ? result.replace("0x", "") : result;
        let v = parseInt("0x" + rsv.substr(128));
        console.log({
          r: "0x" + rsv.substr(0, 64),
          s: "0x" + rsv.substr(64, 64),
          v: "0x" + (Number(v) - 27 === 0 ? "00" : "01"),
        });
        const rsvFormat =
          "0x" +
          rsv.substr(0, 64) +
          rsv.substr(64, 64) +
          (Number(v) - 27 === 0 ? "00" : "01");
        return rsvFormat;
      },
    };
  }, [enode, library, account]);
}

export function useCreateGroup(
  mode: string | undefined,
  nodeArr: Array<string>
): {
  execute?: undefined | (() => Promise<any>);
} {
  return useMemo(() => {
    if (!mode || nodeArr.length <= 0) return {};
    return {
      execute: async () => {
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
  }, [mode, nodeArr]);
}

export function useReqSmpcAddress(
  gID: string | undefined,
  ThresHold: string | undefined,
  Sigs: string | undefined
): {
  execute?: undefined | (() => Promise<any>);
} {
  const { account, library } = useActiveWeb3React();
  return useMemo(() => {
    // if (!library || !account || !gID || !ThresHold || !Sigs) return {};
    if (!library || !account || !gID || !ThresHold) return {};
    return {
      execute: async () => {
        const provider = new ethers.providers.Web3Provider(library.provider);
        const signer = provider.getSigner();
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
          nonce: nonce,
          data: JSON.stringify(data),
        };
        console.log(rawTx);
        const tx = new Tx(rawTx);
        const hash = "0x" + tx.hash().toString("hex");
        const result = await signer.signMessage(hash);
        const rsv =
          result.indexOf("0x") === 0 ? result.replace("0x", "") : result;
        let v = parseInt("0x" + rsv.substr(128));
        rawTx.r = "0x" + rsv.substr(0, 64);
        rawTx.s = "0x" + rsv.substr(64, 64);
        rawTx.v = "0x" + (Number(v) - 27 === 0 ? "00" : "01");
        const tx1 = new Tx(rawTx);
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
