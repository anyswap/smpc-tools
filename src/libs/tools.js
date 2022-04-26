/**
 * @description 生成随机图片
 */
// import Identicon from 'identicon.js'

// const jazzicon = require('jazzicon')
import jazzicon from "@metamask/jazzicon";
import { ethers } from "ethers";

export default {
  MAXVALUE: ethers.constants.MaxUint256.toString(),
  fromTime(timestamp) {
    if (timestamp.toString().length === 10) {
      timestamp = Number(timestamp) * 1000;
    } else if (timestamp.toString().length > 13) {
      timestamp = timestamp.toString().substring(0, 13);
    }
    return Number(timestamp);
  },
  toTime(timestamp) {
    // console.log(timestamp.toString().length)
    if (timestamp.toString().length >= 13) {
      timestamp = timestamp.toString().substring(0, 10);
    }
    return Number(timestamp);
  },
  thousandBit(num, dec = 2) {
    if (!Number(num)) {
      if (typeof dec !== "underfined") {
        // console.log(num)
        return Number(num).toFixed(dec);
      }
      return "0.00";
    }
    if (Number(num) < 1) return Number(Number(num).toFixed(6));
    if (Number(num) < 0.00000001) return "<0.00000001";
    if (Number(num) < 1000) {
      if (isNaN(dec)) {
        return num;
      } else {
        return Number(num).toFixed(dec);
      }
    }
    let _num = (num = Number(num));
    if (isNaN(num)) {
      num = 0;
      num = num.toFixed(dec);
    } else {
      if (isNaN(dec)) {
        if (num.toString().indexOf(".") === -1) {
          num = Number(num).toLocaleString();
        } else {
          let numSplit = num.toString().split(".");
          numSplit[1] =
            numSplit[1].length > 9 ? numSplit[1].substr(0, 8) : numSplit[1];
          num = Number(numSplit[0])
            .toFixed(1)
            .replace(/(\d)(?=(\d{3})+\.)/g, "$1,")
            .toLocaleString();
          num = num.toString().split(".")[0] + "." + numSplit[1];
        }
      } else {
        num = num
          .toFixed(dec)
          .replace(/(\d)(?=(\d{3})+\.)/g, "$1,")
          .toLocaleString();
      }
    }
    if (_num < 0 && num.toString().indexOf("-") < 0) {
      num = "-" + num;
    }
    return num;
  },
  thousandChange(num, dec) {
    num = this.thousandToNum(num);
    return this.thousandBit(num, dec);
  },
  thousandToNum(num) {
    // console.log(num)
    return num.toString().replace(/,/g, "");
  },
  timeChange(timestamp, type, format) {
    let time = timestamp ? new Date(this.fromTime(timestamp)) : new Date();
    let formatType = format ? format : "/";
    let Y = time.getFullYear();
    let M =
      time.getMonth() + 1 < 10
        ? "0" + (time.getMonth() + 1)
        : time.getMonth() + 1;
    let D = time.getDate() < 10 ? "0" + time.getDate() : time.getDate();
    let h = time.getHours() < 10 ? "0" + time.getHours() : time.getHours();
    let m =
      time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes();
    let s =
      time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds();

    if (type === "yyyy-mm-dd") {
      time = Y + formatType + M + formatType + D;
    } else if (type === "yyyy-mm-dd hh:mm") {
      time = Y + formatType + M + formatType + D + " " + h + ":" + m;
    } else if (type === "yyyy-mm-dd hh:mm:ss") {
      time = Y + formatType + M + formatType + D + " " + h + ":" + m + ":" + s;
    } else if (type === "yyyy-mm-dd hh") {
      time = Y + formatType + M + formatType + D + " " + h;
    } else if (type === "yyyy-mm") {
      time = Y + formatType + M;
    } else if (type === "yyyy") {
      time = Y;
    } else if (type === "yy-mm-dd hh:mm") {
      Y = Y.toString().substr(2);
      time = Y + formatType + M + formatType + D + " " + h + ":" + m;
    }
    return time;
  },

  fromWei(amount, baseDecimals = 18, displayDecimals = 8, useLessThan = true) {
    if (!amount) return "0";
    // console.log(amount)
    amount = ethers.utils.bigNumberify(amount.toString());
    displayDecimals = Math.min(displayDecimals, baseDecimals);
    if (
      baseDecimals > 18 ||
      displayDecimals > 18 ||
      displayDecimals > baseDecimals
    ) {
      throw Error(
        `Invalid combination of baseDecimals '${baseDecimals}' and displayDecimals '${displayDecimals}.`
      );
    }

    // if balance is falsy, return undefined
    if (!amount) {
      return undefined;
    }
    // if amount is 0, return
    else if (amount.isZero()) {
      return "0";
    } else {
      // amount of 'wei' in 1 'ether'
      const baseAmount = ethers.utils
        .bigNumberify(10)
        .pow(ethers.utils.bigNumberify(baseDecimals));

      const minimumDisplayAmount = baseAmount.div(
        ethers.utils
          .bigNumberify(10)
          .pow(ethers.utils.bigNumberify(displayDecimals))
      );

      // if balance is less than the minimum display amount
      if (amount.lt(minimumDisplayAmount)) {
        return useLessThan
          ? `<${ethers.utils.formatUnits(minimumDisplayAmount, baseDecimals)}`
          : `${ethers.utils.formatUnits(amount, baseDecimals)}`;
      }
      // if the balance is greater than the minimum display amount
      else {
        const stringAmount = ethers.utils.formatUnits(amount, baseDecimals);

        // if there isn't a decimal portion
        if (!stringAmount.match(/\./)) {
          return stringAmount;
        }
        // if there is a decimal portion
        else {
          const [wholeComponent, decimalComponent] = stringAmount.split(".");
          const roundedDecimalComponent = ethers.utils
            .bigNumberify(decimalComponent.padEnd(baseDecimals, "0"))
            .toString()
            .padStart(baseDecimals, "0")
            .substring(0, displayDecimals);

          // decimals are too small to show
          if (roundedDecimalComponent === "0".repeat(displayDecimals)) {
            return wholeComponent;
          }
          // decimals are not too small to show
          else {
            return `${wholeComponent}.${roundedDecimalComponent
              .toString()
              .replace(/0*$/, "")}`;
          }
        }
      }
    }
  },
  toWei(value, dec = 18) {
    return ethers.utils.parseUnits(value.toString(), dec);
  },
  limitCoin(num, limit, type) {
    let callback = {
      flag: true,
      msg: "",
    };
    if (num < limit) {
      callback = {
        flag: true,
        msg: "The amount cannot be less than " + limit,
      };
    } else if (
      type &&
      type === "INT" &&
      Number(num).toString().indexOf(".") !== -1
    ) {
      callback = {
        flag: true,
        msg: "Please enter an integer",
      };
    } else {
      callback = {
        flag: false,
        msg: "",
      };
    }
    return callback;
  },
  fixPkey(key) {
    if (key.indexOf("0x") === 0) {
      return key.slice(2);
    }
    return key;
  },
  strToHexCharCode(str) {
    if (!str) return "";
    let hexCharCode = [];
    hexCharCode.push("0x");
    for (let i = 0; i < str.length; i++) {
      hexCharCode.push(str.charCodeAt(i).toString(16));
    }
    return hexCharCode.join("");
  },
  cutOut(str, start, end) {
    // console.log(str)
    if (!str) return "";
    let str1 = str.substr(0, start);
    let str2 = str.substr(str.length - end);
    return (str = str1 + "…" + str2);
  },
  changeState(code) {
    code = Number(code);
    // console.log(code)
    let status = "";
    switch (code) {
      case 0:
        status = "Pending";
        break;
      case 1:
        status = "Success";
        break;
      case 2:
        status = "Failure";
        break;
      case 3:
        status = "New";
        break;
      case 4:
        status = "Refuse";
        break;
      case 5:
        status = "Agree";
        break;
      case 6:
        status = "Timeout";
        break;
    }
    // console.log(status)
    return status;
  },
  replaceStr(val, str) {
    str = str ? str : "ERC20";
    return val.replace(str, "");
  },
  toMillion(num, dec = 2) {
    num = Number(num);
    if (num >= 1000 && num < 1000000) {
      num = num / Math.pow(10, 3);
      num = this.thousandBit(num, dec);
      num = num + " K";
    } else if (num >= 1000000 && num < 1000000000) {
      num = num / Math.pow(10, 6);
      num = this.thousandBit(num, dec);
      num = num + " M";
    } else if (num >= 1000000000) {
      num = num / Math.pow(10, 9);
      num = this.thousandBit(num, dec);
      num = num + " B";
    } else {
      num = this.thousandBit(num, dec);
    }
    // console.log(this)
    return num;
  },
  cutERC20(str) {
    if (!str) {
      return {
        type: 0,
        coinType: "",
      };
    }
    if (str.indexOf("ERC20") === 0) {
      return {
        type: 1,
        coinType: str.replace("ERC20", ""),
      };
    } else {
      return {
        type: 0,
        coinType: str.replace("ERC20", ""),
      };
    }
  },
  titleCase(str) {
    if (!str) return;
    str = str.substr(0, 1).toUpperCase();
    return str;
  },
  getBlob(mime, str) {
    let _typeof =
      typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
        ? function (obj) {
            return typeof obj;
          }
        : function (obj) {
            return obj &&
              typeof Symbol === "function" &&
              obj.constructor === Symbol &&
              obj !== Symbol.prototype
              ? "symbol"
              : typeof obj;
          };
    let str1 =
      (typeof str === "undefined" ? "undefined" : _typeof(str)) === "object"
        ? JSON.stringify(str)
        : str;
    if (str1 == null) return "";

    let blob;
    try {
      blob = new Blob([str1], { type: mime });
    } catch (e) {
      // TypeError old chrome and FF
      let BlobBuilder =
        window.BlobBuilder ||
        window.WebKitBlobBuilder ||
        window.MozBlobBuilder ||
        window.MSBlobBuilder;
      if (e.name === "TypeError" && window.BlobBuilder) {
        blob = new BlobBuilder();
        blob.append([str1.buffer]);
        blob = blob.getBlob(mime);
      } else {
        let tip = "Browser does not support";
        alert(tip);
        throw tip;
      }
    }
    return window.URL.createObjectURL(blob);
  },
  walletRequirePass(ethjson) {
    let jsonArr;
    try {
      jsonArr = JSON.parse(ethjson);
    } catch (err) {
      let errtxt1 = "This is not a valid wallet file. ";
      throw errtxt1;
    }
    if (jsonArr.encseed != null) {
      return true;
    } else if (jsonArr.Crypto != null || jsonArr.crypto != null) {
      return true;
    } else if (jsonArr.hash != null && jsonArr.locked) {
      return true;
    } else if (jsonArr.hash != null && !jsonArr.locked) {
      return false;
    } else if (jsonArr.publisher === "MyEtherWallet" && !jsonArr.encrypted) {
      return false;
    } else {
      let errtxt2 = "Sorry! We don't recognize this type of wallet file. ";
      throw errtxt2;
    }
  },
  // smallToBigSort () {
  //   return (a, b) => {
  //     // console.log(a)
  //     // console.log(b)
  //     for (let obj in arguments) {
  //       console.log(obj)
  //       if (Number(a[arguments[obj]]) > Number(b[arguments[obj]])) {
  //         return 1
  //       }
  //     }
  //     return -1
  //   }
  // },
  smallToBigSort(propertyArray) {
    let levelCount = propertyArray.length;

    return function (item1, item2) {
      let level = 0;
      let sorting = function () {
        let propertyName = propertyArray[level];
        level++;

        let itemCell1 = item1[propertyName],
          itemCell2 = item2[propertyName];
        if (itemCell1 < itemCell2) {
          return -1; //从小到大排序
        } else if (itemCell1 > itemCell2) {
          return 1;
        } else if (itemCell1 === itemCell2) {
          if (level === levelCount) {
            return 0;
          } else {
            return sorting();
          }
        }
      };
      return sorting();
    };
  },
  // bigToSmallSort () {
  //   return (a, b) => {
  //     for (let obj in arguments) {
  //       if (Number(a[arguments[obj]]) > Number(b[arguments[obj]])) {
  //         return -1
  //       }
  //     }
  //     return 1
  //   }
  // },
  bigToSmallSort(propertyArray) {
    let levelCount = propertyArray.length;

    return function (item1, item2) {
      let level = 0;
      let sorting = function () {
        let propertyName = propertyArray[level];
        level++;

        let itemCell1 = item1[propertyName],
          itemCell2 = item2[propertyName];
        if (itemCell1 < itemCell2) {
          return 1; //从小到大排序
        } else if (itemCell1 > itemCell2) {
          return -1;
        } else if (itemCell1 === itemCell2) {
          if (level === levelCount) {
            return 0;
          } else {
            return sorting();
          }
        }
      };
      return sorting();
    };
  },
  eNodeCut(enode) {
    let obj = {
      key: "",
      ip: "",
      enode: "",
    };
    if (!enode || enode.indexOf("enode://") === -1 || enode.indexOf("@") === -1)
      return obj;
    let enodeObj = enode.match(/enode:\/\/(\S*)@/);
    let ip = enode.match(/@(\S*)/)[1];
    // console.log(enodeObj)
    // console.log(ip)
    return {
      key: enodeObj[1],
      ip: ip,
      enode: enodeObj.input,
    };
  },
  splitTx(tx) {
    if (!tx)
      return {
        address: "",
        signTx: "",
        eNode: "",
        ip: "",
        eNodeId: "",
      };
    tx = tx.split("0x");
    let obj = this.eNodeCut(tx[0]);
    return {
      address: tx[2] ? "0x" + tx[2] : "",
      signTx: tx[1] ? "0x" + tx[1] : "",
      eNode: tx[0],
      ip: obj && obj.ip ? obj.ip : "",
      eNodeId: obj && obj.key ? obj.key : "",
    };
  },
  createImg(hex, width, id) {
    id = id ? id : "headerPic";
    width = width ? width : 36;
    // let imgData = new Identicon(hex).toString()
    // let imgInfo = 'data:image/png;base64,' + imgData // 这就是头像的base64码
    // console.log(jazzicon(100, Math.round(Math.random() * 10000000)))
    // return imgInfo
    // return jazzicon(100, 10000000)
    if (document.getElementById("headerPic")) {
      document.getElementById("headerPic").innerHTML = "";
      document.getElementById("headerPic").appendChild(jazzicon(width, hex));
    }
  },
  openUrl(url) {
    window.open(url);
  },
  compareVersion(vOld, vNew) {
    let level = 0;
    if (vOld) {
      let vOldArr = vOld.split(".");
      let vNewArr = vNew.split(".");
      if (vOldArr[0] < vNewArr[0]) {
        level = 1;
      } else if (vOldArr[1] < vNewArr[1]) {
        level = 2;
      } else if (vOldArr[2] < vNewArr[2]) {
        level = 3;
      }
    } else {
      level = 1;
    }
    return level;
  },
  timeToDays(timestamp) {
    if (!timestamp) return;
    let time = Date.now() - timestamp;
    let days = time / (1000 * 60 * 60 * 24);
    days = Math.ceil(days);
    return days;
  },
  formatChainId(list, chainID, type) {
    if (list && list[chainID]) {
      if (type) {
        return list[chainID][type];
      }
      return list[chainID].name;
    }
    return chainID;
  },
  getStatus(status, type) {
    if (type === "swapin") {
      let statusType = "";
      if ([2, 4, 6, 11, 14].includes(status)) {
        statusType = "pending";
      } else if ([0, 5, 8].includes(status)) {
        statusType = "confirming";
      } else if ([7, 9].includes(status)) {
        statusType = "minting";
      } else if ([10].includes(status)) {
        statusType = "success";
      } else if ([1, 16].includes(status)) {
        statusType = "failure";
      } else if ([20].includes(status)) {
        statusType = "timeout";
      } else if ([12].includes(status)) {
        statusType = "Big Amount";
      } else if ([3].includes(status)) {
        statusType = "Exceed limit";
      }
      return statusType;
    } else {
      let statusType = "pending";
      if ([2, 4, 6, 11, 14].includes(status)) {
        statusType = "pending";
      } else if ([0, 5, 8, 9].includes(status)) {
        statusType = "confirming";
      } else if ([10].includes(status)) {
        statusType = "success"; // outnetsuccess
      } else if ([1, 16].includes(status)) {
        statusType = "failure";
      } else if ([20].includes(status)) {
        statusType = "timeout";
      } else if ([12].includes(status)) {
        statusType = "Big Amount";
      } else if ([3].includes(status)) {
        statusType = "Exceed limit";
      } else {
        statusType = "pending";
      }
      return statusType;
    }
  },
  timesFun(time, now) {
    // let nowTime = Date.parse(now)
    let nowTime = now ? now : Date.parse(new Date());
    // console.log(nowTime)
    time = time.toString().length > 10 ? time : time * 1000;
    // console.log(time)
    let dataTime = 0;
    let callback = 0;
    if (isNaN(time)) {
      dataTime = Date.parse(time);
    } else {
      dataTime = time;
    }
    let timeDiffer = (nowTime - dataTime) / 1000;
    timeDiffer = timeDiffer > 0 ? timeDiffer : 1;

    if (timeDiffer < 60) {
      // seconds
      // console.log(1)
      callback = timeSec(timeDiffer);
    } else if (timeDiffer < 60 * 60) {
      // minute
      // console.log(2)
      callback = timeMin(timeDiffer);
    } else if (timeDiffer < 60 * 60 * 24) {
      // hours
      // console.log(3)
      callback = timeHour(timeDiffer, "min");
    } else {
      // day
      // console.log(4)
      callback = timeDay(timeDiffer, "hour");
    }
    // console.log(callback)
    return callback;
  },
};

function timeSec(time) {
  return time + "s ago";
}

function timeMin(time, type) {
  let seconds = time - Math.floor(time / 60) * 60;
  let callback = Math.floor(time / 60) + " mins " + timeSec(seconds);
  if (type === "min") {
    callback = Math.floor(time / 60) + " mins ";
  } else {
    callback = Math.floor(time / 60) + " mins " + timeSec(seconds);
  }
  return callback;
}

function timeHour(time, type) {
  let hours = Math.floor(time / (60 * 60));
  let minute = timeMin(time - hours * 60 * 60, type);
  let callback = hours + " hours " + minute;
  if (type === "hour") {
    callback = hours + " hours ";
  } else {
    callback = hours + " hours " + minute;
  }
  return callback;
}

function timeDay(time, type) {
  let days = Math.floor(time / (60 * 60 * 24));
  let hours = timeHour(time - days * 60 * 60 * 24, type);
  let callback = days + " days " + hours;
  return callback;
}
