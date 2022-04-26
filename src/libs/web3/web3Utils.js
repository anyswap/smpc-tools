import { ethers } from "ethers";
import web3Fn from "./index";
import Airdrop from "@/config/ABI/Airdrop.json";
import config from "@/config/index.js";

export function getContract(ABI) {
  ABI = ABI ? ABI : Airdrop;
  return new web3Fn.eth.Contract(ABI);
}

// export function getBaseInfo (from, input, to, value) {
export function getBaseInfo(params) {
  let value = ethers.utils.parseUnits(params.value.toString(), 18);
  let data = {
    msg: "Error",
  };
  let rawTx = {
    to: params.to,
    data: params.data,
    value: value,
  };
  return new Promise((resolve) => {
    web3Fn.setProvider(config.rpc);
    const batch = new web3Fn.BatchRequest();
    batch.add(web3Fn.eth.estimateGas.request(rawTx));
    batch.add(web3Fn.eth.getGasPrice.request());
    batch.add(web3Fn.eth.getTransactionCount.request(params.from));

    batch.requestManager.sendBatch(batch.requests, (err, res) => {
      if (err) {
        logger.error(err);
        resolve(data);
      } else {
        let isError = false;
        if (res[0] && res[0].result) {
          rawTx.gas = parseInt(res[0].result);
          rawTx.gas = web3Fn.utils.numberToHex(rawTx.gas * 10);
        } else {
          rawTx.gas = web3Fn.utils.numberToHex(2000000);
        }
        if (res[1] && res[1].result) {
          rawTx.gasPrice = res[1].result;
        } else {
          isError = true;
        }
        if (res[2] && res[2].result) {
          rawTx.nonce = res[2].result;
        } else {
          isError = true;
        }
        if (isError) {
          resolve(data);
        } else {
          data = {
            msg: "Success",
            info: rawTx,
          };
          resolve(data);
        }
      }
    });
  });
}
