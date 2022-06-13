import { nodeListService } from "@/api";
import config from "@/config";
import { reducer } from "@/utils";
import { useEffect, useReducer } from "react";
import moment from "moment";
import web3 from "@/assets/js/web3";

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
    const interval = setInterval(async () => {
      web3.setProvider(rpc);
      const res = await fn(...params);
      if (res.Status === "Success") {
        clearInterval(interval);
        const newPollingRsv = pollingRsv.filter(
          (item: any, index: number) => index !== i
        );
        localStorage.setItem("pollingRsv", JSON.stringify(newPollingRsv));
        const result = JSON.parse(res?.Data?.result || "{}");

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
        // 设置交易审批记录页面数据
        const sendApprovaled = JSON.parse(
          localStorage.getItem("sendApprovaled") || "[]"
        );
        localStorage.setItem(
          "sendApprovaled",
          JSON.stringify([{ ...data, Rsv: res.Data.result }, ...sendApprovaled])
        );
        dispatch({
          pollingRsvInfo: pollingRsvInfo + 1,
        });
        localStorage.setItem("pollingRsvInfo", pollingRsvInfo + 1);
      }
    }, 30000);
    const newPollingRsvActiveInterval = pollingRsvActiveInterval;
    newPollingRsvActiveInterval[i] = interval;
    dispatch({
      pollingRsvActiveInterval: newPollingRsvActiveInterval,
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
    const interval = setInterval(async () => {
      web3.setProvider(rpc);
      const res = await fn(...params);
      debugger;
      if (res.Status === "Success") {
        clearInterval(interval);
        const newPollingPubKey = pollingPubKey.filter(
          (item: any, index: number) => index !== i
        );
        localStorage.setItem("pollingPubKey", JSON.stringify(newPollingPubKey));

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
        });
        localStorage.setItem("pollingPubKeyInfo", pollingPubKeyInfo + 1);
      }
    }, 30000);
    const newPollingPubKeyActiveInterval = pollingPubKeyActiveInterval;
    newPollingPubKeyActiveInterval[i] = interval;
    dispatch({
      pollingRsvActiveInterval: newPollingPubKeyActiveInterval,
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
