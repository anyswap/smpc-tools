import { getAddress } from "@ethersproject/address";
import { message } from "antd";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { formatFixed, parseFixed } from "@ethersproject/bignumber";

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
