import { useActiveWeb3React } from "@/hooks";
import { useCallback, useMemo } from "react";
const BigNumber = require("bignumber.js");

import { ethers } from "ethers";
import { abi } from "@/assets/js/web3";
import web3 from "@/assets/js/web3";

const Web3 = require("web3");
// const Web3 = require("web3");
// let web3Fn = new Web3(new Web3.providers.HttpProvider('http://81.69.176.223:5917'));

// const Tx = require("ethereumjs-tx");
import Tx from "ethereumjs-tx";
import { message } from "antd";
import { useModel } from "umi";
import { chainInfo } from "@/config/chainConfig";
// console.log(Tx)
export enum WrapType {
  NOT_APPLICABLE,
  WRAP,
  UNWRAP,
  NOCONNECT,
}

// const CHAINID = "4";
// const CHAINID = "30400";

const NOCONNECT = { wrapType: WrapType.NOCONNECT };

export function signData(data: any) {
  return new Promise((resolve, reject) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const rawTx = {
      value: "0x0",
      chainId: "0x0",
      nonce: "0x0",
      // data: ethers.utils.toUtf8Bytes(JSON.stringify(data)).toString('hex'),
      data: JSON.stringify(data),
      // data: web3.utils.utf8ToHex(JSON.stringify(data)),
    };
    console.log(rawTx);
    const tx = new Tx(rawTx);
    let hash = Buffer.from(tx.hash(false)).toString("hex");
    hash = hash.indexOf("0x") === 0 ? hash : "0x" + hash;
    signer
      .signMessage(JSON.stringify(data))
      .then((res: any) => {
        const rsv = res.indexOf("0x") === 0 ? res.replace("0x", "") : res;
        const result = {
          rsv: rsv,
          r: rsv.substr(0, 64),
          s: rsv.substr(64, 64),
          v: rsv.substr(128),
        };
        tx.r = "0x" + result.r;
        tx.s = "0x" + result.s;
        tx.v = "0x" + result.v;
        // rawTx.hash = '\x19Ethereum Signed Message:\n' + hash
        let signTx = tx.serialize().toString("hex");
        signTx = signTx.indexOf("0x") === 0 ? signTx : "0x" + signTx;
        resolve(signTx);
      })
      .catch((error: any) => {
        reject(error);
      });
  });
}

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
let nonceLocal = 0;
async function getNonce(account: any, rpc: any) {
  web3.setProvider(rpc);
  const nonceResult = await web3.smpc.getReqAddrNonce(account);
  nonceLocal++;
  // return nonceLocal;
  return nonceResult.Data.result;
}

const getSignNonce = async (account: any, rpc: any) => {
  web3.setProvider(rpc);
  const nonceResult = await web3.smpc.getReqAddrNonce(account);
  return nonceResult.Data.result;
};

export function useSign(): any {
  const { account, library, chainId } = useActiveWeb3React();

  const signMessage = useCallback(
    (hash: any) => {
      return new Promise((resolve) => {
        const params = [account, hash];
        const method = "eth_sign";
        // console.log(params);
        if (library) {
          library
            .send(method, params)
            .then((res: any) => {
              // console.log(res);
              // return result;
              const rsv = res.indexOf("0x") === 0 ? res.replace("0x", "") : res;
              const v0 = parseInt("0x" + rsv.substr(128));
              const v = Number(chainId) * 2 + 35 + Number(v0) - 27;
              const result = {
                rsv: res,
                r: rsv.substr(0, 64),
                s: rsv.substr(64, 64),
                v0: Number(v0) - 27 === 0 ? "00" : "01",
                v: web3.utils.toHex(v).replace("0x", ""),
                v1: rsv.substr(128),
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
      });
    },
    [library]
  );
  return {
    signMessage,
  };
}

export function useSendTxDemo(): {
  execute?: undefined | (() => Promise<any>);
} {
  const { account, library } = useActiveWeb3React();
  const { signMessage } = useSign();
  return useMemo(() => {
    if (!account || !library || !signMessage) return {};
    return {
      execute: async () => {
        // web3.setProvider("https://bsc-dataseed1.defibit.io/");
        const data = {
          from: account,
          to: "0xC03033d8b833fF7ca08BF2A58C9BC9d711257249",
          chainId: web3.utils.toHex(56),
          // chainId: 56,
          value: "1",
          nonce: "",
          gas: "",
          gasPrice: "",
          data: "",
        };
        data.nonce = await web3.eth.getTransactionCount(account);
        data.gas = await web3.eth.estimateGas({ to: data.to });
        data.gas = data.gas * 2;
        data.gasPrice = await web3.eth.getGasPrice();
        data.gasPrice = Number(data.gasPrice);
        console.log(data);
        const tx = new Tx(data);
        let hash = Buffer.from(tx.hash(false)).toString("hex");
        hash = hash.indexOf("0x") === 0 ? hash : "0x" + hash;
        // star
        const result = await signMessage(hash);
        const v0 = parseInt("0x" + result.v1);
        // const v0 = 0
        const v = Number(56) * 2 + 35 + Number(v0) - 27;
        tx.r = "0x" + result.r;
        tx.s = "0x" + result.s;
        console.info("v", v);
        console.info("web3.utils.toHex(v)", web3.utils.toHex(v));
        tx.v = web3.utils.toHex(v);
        // end
        // tx.v = "0x" + result.v;
        let signTx = tx.serialize().toString("hex");
        signTx = signTx.indexOf("0x") === 0 ? signTx : "0x" + signTx;
        web3.eth.sendSignedTransaction(signTx).then((res: any) => {
          console.log(res);
          debugger;
        });
      },
    };
  }, [account, signMessage]);
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
        // console.log(eNodeKey)
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(eNodeKey));
        // const hash = ethers.utils.keccak256('0x' + (eNodeKey))
        // const hash = ethers.utils.hashMessage(eNodeKey)
        // const hash = eNodeKey;
        // const result = await signer.signMessage(eNodeKey);
        // const result = await signer.signMessage(hash);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        let rsv = await signer.signMessage(eNodeKey);
        rsv = rsv.slice(0, 130) + (rsv.slice(130) === "1b" ? "00" : "01");
        return rsv;

        // const result = await signMessage(hash);
        // if (!result) {
        //   message.info("no sign");
        //   return;
        // }

        // const rsvFormat = "0x" + result.r + result.s + result.v0;
        // return rsvFormat;
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
        const result = await web3.smpc.createGroup(
          mode,
          nodeArr.map((item: string) => item.split("0x")[0])
        );
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
  Sigs: string | undefined,
  keytype: string
): {
  execute?: undefined | (() => Promise<any>);
} {
  const { account, library } = useActiveWeb3React();
  const { signMessage } = useSign();
  return useMemo(() => {
    if (!library || !account || !gID || !ThresHold || !Sigs || !keytype)
      return {};
    // if (!library || !account || !gID || !ThresHold) return {};
    return {
      execute: async () => {
        // const provider = new ethers.providers.Web3Provider(library.provider);
        // const signer = provider.getSigner();
        // web3.setProvider('http://47.114.115.33:5913/')
        web3.setProvider(rpc);
        const nonce = await getNonce(account, rpc);
        const data = {
          TxType: "REQSMPCADDR",
          Account: account,
          Nonce: nonce,
          keytype,
          GroupId: gID,
          ThresHold: ThresHold,
          Mode: "2",
          AcceptTimeOut: "604800", // AcceptTimeOut: "60", // 测试超时用
          TimeStamp: Date.now().toString(),
          Sigs,
        };
        console.info("Sigs", Sigs);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        let rsv = await signer.signMessage(JSON.stringify(data, null, 8));
        debugger;
        // 如果v是1b换成00 如果v是1c换成01
        rsv = rsv.slice(0, 130) + (rsv.slice(130) === "1b" ? "00" : "01");
        debugger;
        let cbData = await web3.smpc.reqKeyGen(
          rsv,
          JSON.stringify(data, null, 8)
        );
        let resultData: any = {};
        if (cbData && typeof cbData === "string") {
          cbData = JSON.parse(cbData);
        }
        if (cbData.Status !== "Error") {
          resultData = { msg: "Success", info: cbData.Data.result };
        } else {
          resultData = { msg: cbData.Error || "Error", error: cbData.Tip };
        }
        return resultData;
      },
    };
  }, [account, library, gID, ThresHold, Sigs]);
}

type ApproveRecordType = {
  Key: any;
  GroupID: string;
  Mode: string;
  ThresHold: string;
  Cointype: string;
};

export function useApproveReqSmpcAddress(rpc: string | undefined): {
  execute?: undefined | ((r: ApproveRecordType, type: any) => Promise<any>);
} {
  const { account, library } = useActiveWeb3React();
  const { signMessage } = useSign();
  return useMemo(() => {
    // if (!library || !account || !gID || !ThresHold || !Sigs) return {};
    if (!library || !account) return {};
    return {
      execute: async (r: ApproveRecordType, type: any) => {
        const { Key, GroupID, Mode, ThresHold, Cointype: Keytype } = r;
        // const provider = new ethers.providers.Web3Provider(library.provider);
        // const signer = provider.getSigner();
        // web3.setProvider('http://47.114.115.33:5913/')
        web3.setProvider(rpc);
        const Nonce = await getNonce(account, rpc);
        const data = {
          TxType: "ACCEPTREQADDR",
          Account: account,
          Nonce,
          Key,
          Accept: type, // DISAGREE
          TimeStamp: Date.now().toString(),
        };
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        let rsv = await signer.signMessage(JSON.stringify(data, null, 8));
        // 如果v是1b换成00 如果v是1c换成01
        rsv = rsv.slice(0, 130) + (rsv.slice(130) === "1b" ? "00" : "01");
        let cbData = await web3.smpc.acceptKeyGen(
          rsv,
          JSON.stringify(data, null, 8)
        );

        // let cbData = await web3.smpc.acceptReqAddr(signTx);
        let resultData: any = {};
        if (cbData && typeof cbData === "string") {
          cbData = JSON.parse(cbData);
        }
        if (cbData.Status !== "Error") {
          resultData = { msg: "Success", info: cbData.Data.result };
        } else {
          resultData = { msg: "Error", error: cbData.Tip };
        }
        return resultData;
      },
    };
  }, [account, library]);
}

type GetSignType = {
  GroupID: string;
  PubKey: string;
  ThresHold: string;
  address: string;
};

const buildTxnsData = (
  TokenAddress: string,
  nodeRpc: string,
  to: string,
  value: string,
  chainId: string
) => {
  let newWeb3;
  let currentProvider = new Web3.providers.HttpProvider(nodeRpc);
  try {
    newWeb3 = new Web3(currentProvider);
  } catch (error) {
    newWeb3 = new Web3();
  }
  const contract = new newWeb3.eth.Contract(abi);
  contract.options.address = TokenAddress;
  debugger;
  const chainDetial = chainInfo[web3.utils.hexToNumber(chainId)];
  const valueBigNumber = ethers.utils.parseUnits(
    value,
    chainDetial.decimals || "18"
  );
  debugger;
  const data = contract.methods.transfer(to, valueBigNumber).encodeABI();
  return data;
};

function useMsgData(): {
  execute?:
    | undefined
    | ((
        to: string,
        value: string,
        address: string,
        TokenAddress: string | null
      ) => Promise<any>);
} {
  // web3.setProvider('https://bsc-dataseed1.defibit.io/')
  const { account, library, chainId }: any = useActiveWeb3React();
  const { signMessage } = useSign();
  return useMemo(() => {
    if (!account || !library) return {};
    return {
      execute: async (to, value, address, TokenAddress) => {
        // web3.setProvider("https://rinkeby.infura.io/v3/");
        console.info("chainId", chainId);
        console.info("chainInfo", chainInfo);
        const aa = web3.utils.hexToNumber(chainId);
        debugger;
        const nodeRpc = chainInfo[chainId].nodeRpc;
        web3.setProvider(nodeRpc);
        const data: any = {
          from: address,
          to: TokenAddress ? TokenAddress : to,
          chainId: web3.utils.toHex(chainId),
          value: TokenAddress
            ? "0x0"
            : web3.utils.toHex(web3.utils.toWei(value, "ether")),
          nonce: "",
          gas: "",
          gasPrice: "",
          data: TokenAddress
            ? buildTxnsData(TokenAddress, nodeRpc, to, value, chainId)
            : "{}",
        };
        console.info("chainInfochainInfo", chainInfo);
        console.info("chainInfo[chainId].nodeRpc", chainInfo[chainId].nodeRpc);
        web3.setProvider(nodeRpc);
        data.nonce = await web3.eth.getTransactionCount(address);
        data.gas = await web3.eth.estimateGas(data);
        // data.gas = 100000;
        data.gasPrice = await web3.eth.getGasPrice();
        data.gasPrice = Number(data.gasPrice);
        return data;
      },
    };
  }, [account, signMessage]);
}

const toTxnHash = (data: any) => {
  let tx = new Tx(data);
  let hash = Buffer.from(tx.hash(false)).toString("hex");
  hash = hash.indexOf("0x") == 0 ? hash : "0x" + hash;
  return hash;
};

export function useGetSign(rpc: string | undefined): {
  execute?:
    | undefined
    | ((
        r: GetSignType,
        to: string,
        value: string,
        TokenAddress: string | null,
        symbol: string | null
      ) => Promise<any>);
} {
  const { globalDispatch, pollingRsv } = useModel(
    "global",
    ({ globalDispatch, pollingRsv }: any) => ({
      globalDispatch,
      pollingRsv,
    })
  );
  const { account, library } = useActiveWeb3React();
  const { signMessage } = useSign();
  const { execute } = useMsgData();
  return useMemo(() => {
    if (!account || !library || !execute) return {};
    return {
      execute: async (r, to, value, TokenAddress, symbol) => {
        const { GroupID, PubKey, ThresHold, address } = r;
        const MsgContext = await execute(to, value, address, TokenAddress);
        const Nonce = await getSignNonce(account, rpc);
        web3.setProvider(rpc);
        // to 0xC03033d8b833fF7ca08BF2A58C9BC9d711257249
        const data = {
          TxType: "SIGN",
          Account: account,
          Nonce,
          PubKey,
          MsgHash: [toTxnHash(MsgContext)],
          MsgContext: [
            JSON.stringify({
              ...MsgContext,
              originValue: value,
              TokenAddress,
              symbol,
            }),
          ],
          Keytype: "EC256K1",
          GroupID,
          ThresHold,
          Mode: "2",
          // AcceptTimeOut: "60", // 测试超时用
          AcceptTimeOut: "604800",
          TimeStamp: Date.now().toString(),
        };
        debugger;
        web3.setProvider(rpc);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        let rsv = await signer.signMessage(JSON.stringify(data, null, 8));
        // 如果v是1b换成00 如果v是1c换成01
        rsv = rsv.slice(0, 130) + (rsv.slice(130) === "1b" ? "00" : "01");

        const cbData = await web3.smpc.signing(
          rsv,
          JSON.stringify(data, null, 8)
        );
        if (cbData.Data?.result) {
          globalDispatch({
            pollingRsv: [
              {
                fn: "getSignStatus",
                params: [cbData.Data?.result],
                data: { ...r, to, value, MsgContext, MsgHash: data.MsgHash },
              },
              ...JSON.parse(localStorage.getItem("pollingRsv") || "[]"),
            ],
          });
          localStorage.setItem(
            "pollingRsv",
            JSON.stringify([
              { fn: "getSignStatus", params: [cbData.Data?.result] },
              ...JSON.parse(localStorage.getItem("pollingRsv") || "[]"),
            ])
          );
          // debugger
          // rsv
          // const intervel = setInterval(async () => {
          //   const cbRsv = await web3.smpc.getSignStatus(cbData.Data?.result);
          //   console.info("cbRsv", cbRsv);
          //   debugger;
          // }, 2000);
        } else {
          message.error(cbData.Error || cbData.Tip);
        }
        return cbData;
      },
    };
  }, [account, library]);
}

type AcceptSign = {
  TxType: string;
  Key: string;
  Accept: string;
  TimeStamp: string;
};
export function acceptSign(rpc: string): {
  execute: undefined | ((Accept: string, r: AcceptSign) => Promise<any>);
} {
  const { account, library, chainId } = useActiveWeb3React();

  const { signMessage } = useSign();
  return useMemo(() => {
    return {
      execute: async (Accept: any, r: any) => {
        web3.setProvider(rpc);
        const Nonce = await getNonce(account, rpc);
        const { Key } = r;
        const data = {
          TxType: "ACCEPTSIGN",
          Account: account,
          Nonce,
          Key,
          Accept,
          TimeStamp: Date.now().toString(),
          MsgHash: r.MsgHash,
          MsgContext: r.MsgContext,
        };

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        let rsv = await signer.signMessage(JSON.stringify(data, null, 8));
        // 如果v是1b换成00 如果v是1c换成01
        rsv = rsv.slice(0, 130) + (rsv.slice(130) === "1b" ? "00" : "01");

        let cbData = await web3.smpc.acceptSigning(
          rsv,
          JSON.stringify(data, null, 8)
        );
        if (cbData.Data?.result) {
          // // rsv
          // const intervel = setInterval(async () => {
          //   const cbRsv = await web3.smpc.getSignStatus(cbData.Data?.result);
          //   console.info("cbRsv", cbRsv);
          //   debugger;
          // }, 1000);
        }
        return cbData;
      },
    };
  }, []);
}
