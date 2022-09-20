import { getAddress } from "@ethersproject/address";
import { message } from "antd";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { formatFixed, parseFixed } from "@ethersproject/bignumber";
import web3 from "@/assets/js/web3";
import { ethers } from "ethers";
const jszzicon = require("jazzicon");

const names = ["wei", "kwei", "mwei", "gwei", "szabo", "finney", "ether"];

export const reducer = (state = {}, action: any) => {
  return { ...state, ...action };
};

export function isAddress(value: any): string | false {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}

export function cutOut(str: string, start: number, end: number) {
  // console.log(str)
  if (!str) return "";
  let str1 = str.substr(0, start);
  let str2 = str.substr(str.length - end);
  return (str = str1 + "…" + str2);
}

export const copyTxt = (cont) => {
  let id = "copyInputSelectContent";
  let _input = document.createElement("input");
  _input.type = "text";
  _input.value = cont;
  _input.id = id;
  document.body.append(_input);
  document.getElementById(id).select();
  document.execCommand("Copy");
  if (cont.length > 60) {
    message.success("Copy " + cutOut(cont, 12, 8) + " succeeded!");
  } else {
    message.success("Copy " + cont + " succeeded!");
  }
  document.getElementById(id).remove();
  _input = null;
  id = null;
};

const Web3 = require("web3");

export function getWeb3(rpc: any, provider: any) {
  rpc = rpc ? rpc : "";
  if (provider) {
    // console.log(library)
    const wFn = new Web3(provider);
    // console.log(wFn)
    return wFn;
  } else {
    // console.log(rpc)
    const wFn = new Web3(new Web3.providers.HttpProvider(rpc));
    return wFn;
  }
}

export function formatUnits(
  value: BigNumberish,
  unitName?: string | BigNumberish
): string {
  if (typeof unitName === "string") {
    const index = names.indexOf(unitName);
    if (index !== -1) {
      unitName = 3 * index;
    }
  }
  return formatFixed(value, unitName != null ? unitName : 18);
}

export const getHead = (TimeStamp: number) => {
  return `data:image/svg+xml;base64,${window.btoa(
    unescape(
      encodeURIComponent(
        new XMLSerializer().serializeToString(
          jszzicon(100, Math.round(Number(TimeStamp) / 1000)).children[0]
        )
      )
    )
  )}`;
};

export const getTransactionStatus = (item: any, index?: any) => {
  if (item.Status === "Failure") return null;
  const MsgContext = JSON.parse(item.MsgContext[0]);
  const { chainId, to, value, nonce, gas, gasPrice, data = "" } = MsgContext;
  const Rsv = item.Rsv[0];
  if (
    item.KeyID ===
    "0xb79b6c3ec9bc1d715be3af87d479ba0ae1b3d929a24c6e60f07a9a805e0889c9"
  ) {
    debugger;
  }
  const txData = {
    nonce,
    gasLimit: web3.utils.toHex(gas),
    gasPrice: web3.utils.toHex(gasPrice),
    to,
    data,
    value: web3.utils.toHex(value),
    chainId: web3.utils.hexToNumber(chainId),
  };
  const v =
    Number(web3.utils.hexToNumber(chainId)) * 2 +
    35 +
    Number(Rsv.substr(128, 2));
  let signature = {
    r: "0x" + Rsv.substr(0, 64),
    s: "0x" + Rsv.substr(64, 64),
    v,
  };

  let signedTx = ethers.utils.serializeTransaction(txData, signature);
  let txParse2 = ethers.utils.parseTransaction(signedTx);
  return txParse2.hash;
};
