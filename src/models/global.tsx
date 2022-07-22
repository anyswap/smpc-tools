import { nodeListService } from "@/api";
import config from "@/config";
import { reducer } from "@/utils";
import { useEffect, useReducer } from "react";
import moment from "moment";
import web3 from "@/assets/js/web3";
import { message } from "antd";
const Web3 = require("web3");

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
  pollingRsvInfo: Number(localStorage.getItem("pollingRsvInfo") || 0),
  //创建账号后轮询Pubkey
  pollingPubKey: JSON.parse(localStorage.getItem("pollingPubKey") || "[]"),
  pollingPubKeyInfo: Number(localStorage.getItem("pollingPubKeyInfo") || 0),
  // 已审批交易列表数据
  sendApprovaled: JSON.parse(localStorage.getItem("sendApprovaled") || "[]"),
  // 账户列表数据（审批通过的才展示）
  Account: JSON.parse(localStorage.getItem("Account") || "[]"),

  getRsvSpin: false,
};

export default function Index() {
  const [state, dispatch] = useReducer(reducer, initState);
  const {
    pollingRsv,
    pollingPubKey,
    pollingRsvInfo,
    pollingPubKeyInfo,
    sendApprovaled: GsendApprovaled,
    Account: GAccount,
  } = state;

  // const getNodeList = async () => {
  //   const { rpc } = JSON.parse(localStorage.getItem("loginAccount") || "{}");
  //   if (!rpc) return;
  //   const res = await nodeListService();
  //   dispatch({
  //     nodeList: res.info,
  //   });
  // };

  // useEffect(() => {
  //   const { rpc } = JSON.parse(localStorage.getItem("loginAccount") || "{}");
  //   if (!rpc) return;
  //   // '/nodes/list'
  //   getNodeList();
  // }, []);

  //获取 发起交易的审批结果轮询
  const pollingRsvInterval = (fn: any, params: any, data: any, i: any) => {
    const { rpc } = JSON.parse(localStorage.getItem("loginAccount") || "{}");
    const localStoragePollingRsv = JSON.parse(
      localStorage.getItem("pollingRsv") || "[]"
    );
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
          const newPollingRsv = localStoragePollingRsv.filter(
            (item: any, index: number) => item.params[0] !== params[0]
          );
          localStorage.setItem("newPollingRsv", JSON.stringify(newPollingRsv));
          message.error("创建的交易失败");
          console.info("创建的交易失败", res);
        }
      }
      if (result.Status === "Failure") {
        clearInterval(interval);
        console.info("被拒绝了一笔Rsv申请, 参数是", params);
        console.info("data:", data);
        console.info("index:", i);
        return;
      }

      if (result.Status === "Timeout") {
        clearInterval(interval);
        // 超时了
        console.info("超时了一笔Rsv申请, 参数是", params);
        console.info("data:", data);
        console.info("index:", i);
        return;
      }
      if (res.Status === "Success" && result.Status === "Success") {
        clearInterval(interval);
        const newPollingRsv = localStoragePollingRsv.filter(
          (item: any, index: number) => item.params[0] !== params[0]
        );
        localStorage.setItem("pollingRsv", JSON.stringify(newPollingRsv));
        // 设置已审批交易记录页面数据
        // const sendApprovaled = JSON.parse(
        //   localStorage.getItem("sendApprovaled") || "[]"
        // );
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
  };
  //监听要轮询的队列rsv
  // useEffect(() => {
  //   const { rpc } = JSON.parse(localStorage.getItem("loginAccount") || "{}");
  //   if (!rpc || !pollingRsv.length) return;
  //   pollingRsv.forEach(({ fn, params, data }: any, i: number) => {
  //     pollingRsvInterval(web3.smpc[fn], params, data, i);
  //   });
  //   dispatch({
  //     pollingRsv: [],
  //   });
  // }, [pollingRsv]);

  //获取 发起创建账户后的审批结果 轮询
  const pollingPubKeyResponse = (res, params: any, data: any) => {
    const { rpc } = JSON.parse(localStorage.getItem("loginAccount") || "{}");

    const updateStatus = () => {
      dispatch({
        pollingPubKey: pollingPubKey.filter(
          (item) => item.params[0] !== params[0]
        ),
      });
      localStorage.setItem(
        "pollingPubKey",
        JSON.stringify(
          pollingPubKey.filter((item) => item.params[0] !== params[0])
        )
      );
    };
    web3.setProvider(rpc);
    console.info("...params", params);
    const result = JSON.parse(res?.Data?.result || "{}");
    if (result.Status === "Failure") {
      console.info("被拒绝了一笔PubKey申请, 参数是", params);
      console.info("data:", data);
      console.info("index:", i);
      updateStatus();
      return;
    }

    if (result.Status === "Timeout") {
      console.info("超时了一笔PubKey申请, 参数是", params);
      console.info("data:", data);
      console.info("index:", i);
      updateStatus();
      return;
    }

    // 全部审批成功后端写入数据库失败
    if (
      res.Status === "Success" &&
      result.Status === "Pending" &&
      result.AllReply.every((item: any) => item.Status === "AGREE")
    ) {
      dispatch({
        pollingPubKey: pollingPubKey.map((item: any) => {
          const { count = 0 } = item;
          if (item.params[0] !== params[0]) {
            return item;
          } else {
            return { ...item, count: count + 1 };
          }
        }),
      });
      localStorage.setItem("");
      if (count > 40) {
        // const newPollingPubKey = pollingPubKey.filter(
        //   (item: any, index: number) => index !== i
        // );
        updateStatus();
        message.error("创建帐户失败");
        console.info("创建帐户失败", res);
      }
    }
    // res.Data.result === '' 是没有全部操作审批按钮
    if (res.Status === "Success" && result.Status === "Success") {
      updateStatus();
      // 设置账户列表页面数据
      const Account = JSON.parse(localStorage.getItem("Account") || "[]");
      localStorage.setItem("pollingPubKeyInfo", pollingPubKeyInfo + 1);
      localStorage.setItem(
        "Account",
        JSON.stringify([
          {
            ...result,
            key: params[0],
            GroupID: data.GroupID,
            ThresHold: data.ThresHold,
            PubKey: result.PubKey,
          },
          ...Account.filter((item) => item.key !== params[0]),
        ])
      );

      dispatch({
        pollingPubKeyInfo: pollingPubKeyInfo + 1,
        Account: [
          {
            ...result,
            key: params[0],
            GroupID: data.GroupID,
            ThresHold: data.ThresHold,
            PubKey: result.PubKey,
          },
          ...GAccount.filter((item) => item.key !== params[0]),
        ],
      });
    }
  };

  //监听轮询创建帐户任务
  useEffect(() => {
    const { rpc } = JSON.parse(localStorage.getItem("loginAccount") || "{}");
    const account = window.ethereum?.selectedAddress;
    console.info(rpc, account);
    if (!rpc || !account) return;
    console.info("pollingPubKey", pollingPubKey);
    let interval: any;
    clearInterval(interval);
    if (!pollingPubKey.length) return;
    interval = setInterval(() => {
      console.info("interval", interval);
      web3.setProvider(rpc);
      const batch = new web3.BatchRequest();
      pollingPubKey.forEach(({ fn, params, data }: any) => {
        batch.add(web3.smpc[fn].request(...params));
      });
      batch.requestManager.sendBatch(
        batch.requests,
        (err: any, resArr: any) => {
          if (err) return;
          let newPollingPubKey = pollingPubKey.map((item: any, i: Number) => {
            const { count = 0 } = item;
            const res = resArr[i].result;
            const result = JSON.parse(resArr[i].Data?.result || "{}");
            if (
              res.Status === "Success" &&
              result.Status === "Pending" &&
              result.AllReply.filter((it: any) => it.Status === "AGREE")
                .length >= Number(result.ThresHold[0])
            ) {
              return { ...item, count: count + 1 };
            } else {
              return item;
            }
          });
          const needRemovePollingPubKeyItem = [];
          resArr.forEach((item, i) => {
            const res = item.result;
            const result = JSON.parse(res?.Data?.result || "{}");
            const isFailure = result.Status === "Failure";
            const isTimeout = result.Status === "Timeout";
            const isSuccess =
              res.Status === "Success" && result.Status === "Success";
            if (isFailure || isTimeout || isSuccess) {
              needRemovePollingPubKeyItem.push(i);
            }
          });
          if (needRemovePollingPubKeyItem.length) {
            clearInterval(interval);
            console.info("interval", interval);
            console.info("pollingPubKey", pollingPubKey);
            debugger;
          }
          newPollingPubKey = newPollingPubKey.filter((item, i) => {
            const { count = 0 } = item;
            return !needRemovePollingPubKeyItem.includes(i) && count < 40;
          });
          const successArr = resArr.filter((item, i) => {
            const result = JSON.parse(item.result?.Data?.result || "{}");
            const { count = 0 } = item;
            return (
              result.Status === "Success" ||
              needRemovePollingPubKeyItem.includes(i) ||
              count > 40
            );
          });

          const newAccound = [
            ...successArr.map((item) =>
              JSON.parse(item?.result?.Data?.result || "{}")
            ),
            ...GAccount,
          ];
          dispatch({
            pollingPubKey: newPollingPubKey,
            pollingPubKeyInfo: successArr.length,
            Account: newAccound,
          });
          localStorage.setItem(
            "pollingPubKey",
            JSON.stringify(newPollingPubKey)
          );
          localStorage.setItem("pollingPubKeyInfo", successArr.length);
          localStorage.setItem("Account", JSON.stringify(newAccound));
        }
      );
    }, 30000);
  }, [pollingPubKey]);

  //批量查询Rsv进度
  const getRsv = async () => {
    const { rpc } = JSON.parse(localStorage.getItem("loginAccount") || "{}");
    web3.setProvider(rpc);
    const account = window.ethereum?.selectedAddress;
    let pollingRsv = JSON.parse(localStorage.getItem("pollingRsv") || "[]");
    if (!rpc || !account || !pollingRsv.length) return;
    dispatch({ getRsvSpin: true });
    const batch = new web3.BatchRequest();
    pollingRsv.forEach(({ fn, params }: any) => {
      batch.add(web3.smpc[fn].request(...params));
    });
    batch.requestManager.sendBatch(batch.requests, (err: any, resArr: any) => {
      if (err) return;
      resArr.forEach((item: any, i: number) => {
        if (item.result.Status !== "Success") return;
        const result = JSON.parse(item.result.Data.result);
        if (["Success", "Failure", "Timeout"].includes(result.Status)) {
          console.info("result.Status");
          const newSendApprovaled = [result, ...GsendApprovaled];
          dispatch({
            sendApprovaled: newSendApprovaled,
          });
          localStorage.setItem(
            "sendApprovaled",
            JSON.stringify(newSendApprovaled)
          );
          pollingRsv = pollingRsv.filter(
            (item: any, index: number) => i !== index
          );
        }
      });
    });
    dispatch({ getRsvSpin: false });
    localStorage.setItem("pollingRsv", JSON.stringify(pollingRsv));
  };

  useEffect(() => {
    getRsv();
  }, []);

  return { ...state, globalDispatch: dispatch, getRsv };
}
