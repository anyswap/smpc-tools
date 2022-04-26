/**
 * @description 小工具
 */
import tools from "@/libs/tools";
/**
 * @description 二维码生成方法
 */
import qrCode from "@/libs/qrCode";

import config from "@/config/index.js";

import web3Fn from "@/libs/web3/index.js";

let $$ = {
  ...tools,
  ...qrCode,
  ...config,
  web3Fn,
  getWalletFromPrivKeyFile(strjson, password) {
    var jsonArr = JSON.parse(strjson);
    if (jsonArr.encseed != null) return wallet.fromEthSale(strjson, password);
    else if (jsonArr.Crypto != null || jsonArr.crypto != null)
      return wallet.fromV3(strjson, password, true);
    else throw "Keystore is error!";
  },
  walletRequirePass(ethjson) {
    var jsonArr;
    try {
      jsonArr = JSON.parse(ethjson);
    } catch (err) {
      throw "Keystore error!";
    }
    if (jsonArr.encseed != null) return true;
    else if (jsonArr.Crypto != null || jsonArr.crypto != null) return true;
    else if (jsonArr.hash != null && jsonArr.locked) return true;
    else if (jsonArr.hash != null && !jsonArr.locked) return false;
    else if (jsonArr.publisher == config.AppName && !jsonArr.encrypted)
      return false;
    else throw "Keystore error!";
  },
};

export default $$;
