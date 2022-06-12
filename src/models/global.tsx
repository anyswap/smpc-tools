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
  //创建账号后轮询Pubkey
  pollingPubKey: JSON.parse(localStorage.getItem("pollingPubKey") || "[]"),
  pollingPubKeyActiveInterval: [],
};

export default function Index() {
  const [state, dispatch] = useReducer(reducer, initState);
  const {
    pollingRsv,
    pollingRsvActiveInterval,
    pollingPubKey,
    pollingPubKeyActiveInterval,
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
        debugger;
        localStorage.setItem("pollingRsv", JSON.stringify(newPollingRsv));
        // 设置交易审批记录页面数据
        const sendApprovaled = JSON.parse(
          localStorage.getItem("sendApprovaled") || "[]"
        );
        localStorage.setItem(
          "sendApprovaled",
          JSON.stringify([{ ...data, Rsv: res.Data.result }, ...sendApprovaled])
        );
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
      console.info("rpc", rpc);
      console.info("web3.setProvider", web3.setProvider);
      web3.setProvider(rpc);
      const res = await fn(...params);
      console.info("pollingPubKeyInterval", res);
      if (res.Status === "Success") {
        clearInterval(interval);
        const newPollingPubKey = pollingPubKey.filter(
          (item: any, index: number) => index !== i
        );
        localStorage.setItem("pollingPubKey", JSON.stringify(newPollingPubKey));

        const result = JSON.parse(res?.Data?.result || "{}");
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
