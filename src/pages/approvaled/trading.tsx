import React, { useEffect, useState } from "react";
import { Button, message, Table, Tag } from "antd";
import { useActiveWeb3React } from "@/hooks";
import { useModel, history, useIntl } from "umi";
import Tx from "ethereumjs-tx";
import moment from "moment";
import web3 from "@/assets/js/web3";
import "./style.less";
import { cutOut } from "@/utils";

const Index = () => {
  const { account } = useActiveWeb3React();
  const action: any = {
    AGREE: useIntl().formatHTMLMessage({ id: "approval.agree" }),
    DISAGREE: useIntl().formatHTMLMessage({ id: "approval.disagree" }),
  };

  const {
    globalDispatch,
    sendApprovaled: GsendApprovaled,
    pollingRsvInfo,
  } = useModel(
    "global",
    ({ globalDispatch, sendApprovaled, pollingRsvInfo }) => ({
      globalDispatch,
      sendApprovaled,
      pollingRsvInfo,
    })
  );

  const [data, setData] = useState(
    JSON.parse(localStorage.getItem("sendApprovaled") || "[]")
  );

  useEffect(() => {
    localStorage.setItem("pollingRsvInfo", "0");
    globalDispatch({
      pollingRsvInfo: 0,
    });
  }, []);

  const send = async (r: any, i: any) => {
    console.info("i", i);
    console.info("r", r);
    web3.setProvider(
      "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
    );
    const Rsv = r.Rsv[0];
    const v = Number(4) * 2 + 35 + Number(Rsv.substr(128, 2));
    let rawTx = {
      from: JSON.parse(r.MsgContext[0]).from,
      to: JSON.parse(r.MsgContext[0]).to,
      value: JSON.parse(r.MsgContext[0]).value,
      gas: JSON.parse(r.MsgContext[0]).gas,
      gasPrice: JSON.parse(r.MsgContext[0]).gasPrice,
      nonce: JSON.parse(r.MsgContext[0]).nonce,
      data: "",
      // r: "0x" + Rsv.substr(0, 64),
      // s: "0x" + Rsv.substr(64, 64),
      // v: web3.utils.toHex(v),
      chainId: JSON.parse(r.MsgContext[0]).chainId,
    };
    let tx = new Tx(rawTx);
    let hash = Buffer.from(tx.hash(false)).toString("hex");
    hash = hash.indexOf("0x") === 0 ? hash : "0x" + hash;
    if (hash !== r.MsgHash[0]) {
      message.error("Error: hash");
      debugger;
      return;
    }
    let accountsRecover = web3.eth.accounts.recover({
      messageHash: hash,
      v: "0x" + Rsv.substr(128, 2),
      r: "0x" + Rsv.substr(0, 64),
      s: "0x" + Rsv.substr(64, 64),
    });
    if (accountsRecover) {
      console.info("accountsRecover", accountsRecover);
    }
    tx.r = "0x" + Rsv.substr(0, 64);
    tx.s = "0x" + Rsv.substr(64, 64);
    tx.v = web3.utils.toHex(v);
    let signTx = tx.serialize().toString("hex");
    signTx = signTx.indexOf("0x") === 0 ? signTx : "0x" + signTx;
    web3.eth
      .sendSignedTransaction(signTx)
      .then((res: any) => {
        message.success("Send success");
        const newData = GsendApprovaled.filter(
          (it: any, index: number) => index !== i
        );
        setData(newData);
        globalDispatch({
          sendApprovaled: newData,
        });
        localStorage.setItem("sendApprovaled", JSON.stringify(newData));
      })
      .catch((e: any) => {
        message.error(e.message);
      });
  };
  const sendToEth = useIntl().formatHTMLMessage({ id: "sendToEth" });
  const columns = [
    {
      title: "From",
      dataIndex: "From",
      render: (t: any) => cutOut(t, 6, 4),
    },
    {
      title: "To",
      dataIndex: "MsgContext",
      render: (t: any) => cutOut(JSON.parse(t).to, 6, 4),
    },
    {
      title: "Value",
      dataIndex: "MsgContext",
      render: (t: any) => JSON.parse(t).value,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (t: any, r: any) => {
        return (
          <div>
            {t}
            {r.Error && <p>Reason: {r.Error}</p>}
          </div>
        );
      },
    },
    {
      title: "GroupID",
      dataIndex: "GroupID",
      render: (t: string) => cutOut(t, 6, 4),
    },
    {
      title: "TimeStamp",
      dataIndex: "TimeStamp",
      render: (t: string) => moment(Number(t)).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: useIntl().formatHTMLMessage({ id: "createGrounp.model" }),
      dataIndex: "ThresHold",
    },

    {
      title: useIntl().formatHTMLMessage({ id: "g.action" }),
      // render: (t) => action[t],
      dataIndex: "Status",
      render: (t: any, r: any, i: any) => {
        return t === "Success" ? (
          <a onClick={() => send(r, i)}>{sendToEth}</a>
        ) : (
          "--"
        );
      },
    },
  ];

  // const getRsv = async () => {
  //   const { rpc } = JSON.parse(localStorage.getItem("loginAccount") || "{}");
  //   web3.setProvider(rpc);
  //   const account = window.ethereum?.selectedAddress;
  //   let pollingRsv = JSON.parse(localStorage.getItem("pollingRsv") || "[]");
  //   if (!rpc || !account || !pollingRsv.length) return;

  //   const batch = new web3.BatchRequest();
  //   pollingRsv.forEach(({ fn, params }: any) => {
  //     batch.add(web3.smpc[fn].request(...params));
  //   });
  //   batch.requestManager.sendBatch(batch.requests, (err: any, resArr: any) => {
  //     if (err) return;
  //     console.info("resArr", resArr);
  //     resArr.forEach((item: any, i: number) => {
  //       if (item.result.Status !== "Success") return;
  //       const result = JSON.parse(item.result.Data.result);
  //       if (["Success", "Failure", "Timeout"].includes(result.Status)) {
  //         pollingRsv = pollingRsv.filter(
  //           (item: any, index: number) => i !== index
  //         );
  //       }
  //     });
  //   });
  //   localStorage.setItem("pollingRsv", JSON.stringify(pollingRsv));
  // };

  // useEffect(() => {
  //   getRsv();
  // }, []);

  return (
    <div
      className="approval"
      onMouseMove={() => {
        if (pollingRsvInfo) {
          globalDispatch({
            pollingRsvInfo: 0,
          });
          localStorage.setItem("pollingPubKeyInfo", "0");
        }
      }}
    >
      {/* <Button onClick={getApproveList}>get</Button>{" "} */}
      <Table
        columns={columns}
        rowKey="PubKey"
        dataSource={GsendApprovaled}
        pagination={false}
      />
    </div>
  );
};

export default Index;
