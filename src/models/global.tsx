import { nodeListService } from "@/api";
import config from "@/config";
import { reducer } from "@/utils";
import { useEffect, useReducer } from "react";
import moment from "moment";
import web3 from "@/assets/js/web3";
import { message } from "antd";

const initState = {
  address: "",
  loginAccount: {
    rpc: "",
    enode: "",
    signEnode: "",
  },
  nodeList: [],
  isDay:
    moment().format("YYYY-MM-DD HH:mm:ss") <
      moment().format("YYYY-MM-DD 21:00:00") &&
    moment().format("YYYY-MM-DD HH:mm:ss") >
      moment().format("YYYY-MM-DD 05:30:00"),

  // 发起交易后轮询rsv
  pollingRsv: JSON.parse(localStorage.getItem("pollingRsv") || "[]"),
  pollingRsvActiveInterval: [],
  pollingRsvInfo: Number(localStorage.getItem("pollingRsvInfo") || 0),
  //创建账号后轮询Pubkey
  pollingPubKey: JSON.parse(localStorage.getItem("pollingPubKey") || "[]"),
  pollingPubKeyActiveInterval: [],
  pollingPubKeyInfo: Number(localStorage.getItem("pollingPubKeyInfo") || 0),
  // 已审批交易列表数据
  sendApprovaled: JSON.parse(localStorage.getItem("sendApprovaled") || "[]"),
  // 账户列表数据（审批通过的才展示）
  Account: JSON.parse(localStorage.getItem("Account") || "[]"),
};

export default function Index() {
  const [state, dispatch] = useReducer(reducer, initState);
  const {
    pollingRsv,
    pollingRsvActiveInterval,
    pollingPubKey,
    pollingPubKeyActiveInterval,
    pollingRsvInfo,
    pollingPubKeyInfo,
    sendApprovaled: GsendApprovaled,
    Account: GAccount,
  } = state;

  const getNodeList = async () => {
    const res = await nodeListService();
    dispatch({
      nodeList: res.info,
    });
  };

  useEffect(() => {
    // '/nodes/list'
    getNodeList();
  }, []);

  //获取 发起交易的审批结果 轮询
  const pollingRsvInterval = (fn: any, params: any, data: any, i: any) => {
    const { rpc } = JSON.parse(localStorage.getItem("loginAccount") || "{}");
    let count = 0;
    const interval = setInterval(async () => {
      web3.setProvider(rpc);
      const res = await fn(...params);
      const result = JSON.parse(res?.Data?.result || "{}");
      // 全部审批成功后端写入数据库失败
      if (
        res.Status === "Success" &&
        result.Status === "Pending" &&
        result.AllReply.every((item: any) => item.Status === "AGREE")
      ) {
        count = count + 1;
        if (count > 40) {
          clearInterval(interval);
          const newPollingPubKey = pollingPubKey.filter(
            (item: any, index: number) => index !== i
          );
          localStorage.setItem(
            "pollingPubKey",
            JSON.stringify(newPollingPubKey)
          );
          message.error("创建的交易失败");
          console.info("创建的交易失败", res);
        }
      }
      if (result.Status === "Failure") {
        console.info("被拒绝了一笔Rsv申请, 参数是", params);
        console.info("data:", data);
        console.info("index:", i);
        return;
      }

      if (result.Status === "Timeout") {
        // 超时了
        console.info("超时了一笔Rsv申请, 参数是", params);
        console.info("data:", data);
        console.info("index:", i);
        return;
      }
      if (res.Status === "Success" && result.Status === "Success") {
        clearInterval(interval);
        const newPollingRsv = pollingRsv.filter(
          (item: any, index: number) => index !== i
        );
        localStorage.setItem("pollingRsv", JSON.stringify(newPollingRsv));

        // 设置已审批交易记录页面数据
        const sendApprovaled = JSON.parse(
          localStorage.getItem("sendApprovaled") || "[]"
        );
        localStorage.setItem(
          "sendApprovaled",
          JSON.stringify([
            { ...data, Rsv: res.Data.result },
            ...GsendApprovaled,
          ])
        );
        dispatch({
          pollingRsvInfo: pollingRsvInfo + 1,
          sendApprovaled: [
            { ...data, Rsv: res.Data.result },
            ...GsendApprovaled,
          ],
        });
        localStorage.setItem("pollingRsvInfo", pollingRsvInfo + 1);
      }
    }, 30000);

    dispatch({
      pollingRsvActiveInterval: [...pollingRsvActiveInterval, interval],
    });
  };
  //监听要轮询的队列
  useEffect(() => {
    pollingRsvActiveInterval.forEach((item: any) => {
      clearInterval(item);
    });
    dispatch({
      pollingRsvActiveInterval: [],
    });
    pollingRsv.forEach(({ fn, params, data }: any, i: number) => {
      pollingRsvInterval(web3.smpc[fn], params, data, i);
    });
  }, [pollingRsv]);

  //获取 发起创建账户后的审批结果 轮询
  const pollingPubKeyInterval = (fn: any, params: any, data: any, i: any) => {
    const { rpc } = JSON.parse(localStorage.getItem("loginAccount") || "{}");
    let count = 0;

    const interval = setInterval(async () => {
      web3.setProvider(rpc);
      const res = await fn(...params);
      const result = JSON.parse(res?.Data?.result || "{}");

      if (result.Status === "Failure") {
        console.info("被拒绝了一笔PubKey申请, 参数是", params);
        console.info("data:", data);
        console.info("index:", i);
        return;
      }

      if (result.Status === "Timeout") {
        console.info("超时了一笔PubKey申请, 参数是", params);
        console.info("data:", data);
        console.info("index:", i);
        return;
      }

      // 全部审批成功后端写入数据库失败
      if (
        res.Status === "Success" &&
        result.Status === "Pending" &&
        result.AllReply.every((item: any) => item.Status === "AGREE")
      ) {
        count = count + 1;
        if (count > 40) {
          clearInterval(interval);
          const newPollingPubKey = pollingPubKey.filter(
            (item: any, index: number) => index !== i
          );
          localStorage.setItem(
            "pollingPubKey",
            JSON.stringify(newPollingPubKey)
          );
          message.error("创建帐户失败");
          console.info("创建帐户失败", res);
        }
      }

      // res.Data.result === '' 没有全部操作审批按钮
      if (res.Status === "Success" && result.Status === "Success") {
        clearInterval(interval);
        const newPollingPubKey = pollingPubKey.filter(
          (item: any, index: number) => index !== i
        );
        localStorage.setItem("pollingPubKey", JSON.stringify(newPollingPubKey));
        // 设置账户列表页面数据
        const Account = JSON.parse(localStorage.getItem("Account") || "[]");
        localStorage.setItem(
          "Account",
          JSON.stringify([
            {
              ...result,
              key: result.Key,
              GroupID: data.GroupID,
              ThresHold: data.ThresHold,
              PubKey: result.PubKey,
            },
            ...Account,
          ])
        );
        dispatch({
          pollingPubKeyInfo: pollingPubKeyInfo + 1,
          Account: [
            {
              ...result,
              key: result.Key,
              GroupID: data.GroupID,
              ThresHold: data.ThresHold,
              PubKey: result.PubKey,
            },
            ...GAccount,
          ],
        });
        localStorage.setItem("pollingPubKeyInfo", pollingPubKeyInfo + 1);
      }
    }, 30000);
    dispatch({
      pollingPubKeyActiveInterval: [...pollingPubKeyActiveInterval, interval],
    });
  };
  //监听要轮询的队列
  useEffect(() => {
    pollingPubKeyActiveInterval.forEach((item: any) => {
      clearInterval(item);
    });
    dispatch({
      pollingPubKeyActiveInterval: [],
    });
    pollingPubKey.forEach(({ fn, params, data }: any, i: number) => {
      pollingPubKeyInterval(web3.smpc[fn], params, data, i);
    });
  }, [pollingPubKey]);

  return { ...state, globalDispatch: dispatch };
}
