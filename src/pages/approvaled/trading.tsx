import React, { useEffect, useState } from "react";
import { Button, message, Table, Tag } from "antd";
import { useActiveWeb3React } from "@/hooks";
import { useApproveReqSmpcAddress, useSign, getNonce } from "@/hooks/useSigns";
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

  const send = async (r: any) => {
    console.info(r);
    web3.setProvider("https://bsc-dataseed1.defibit.io/");
    const Rsv = JSON.parse(r.Rsv).Rsv[0];
    let rawTx = {
      from: r.MsgContext.from,
      to: r.MsgContext.to,
      value: r.MsgContext.value,
      gas: r.MsgContext.gas,
      gasPrice: r.MsgContext.gasPrice,
      nonce: r.MsgContext.nonce,
      data: "",
      r: "0x" + Rsv.substr(0, 64),
      s: "0x" + Rsv.substr(64, 64),
      // v: Rsv.substr(128, 2),
      v: web3.utils.toHex(Rsv.substr(128, 2)),
      // v: web3.utils.toHex(v),
      chainId: r.MsgContext.chainId,
    };

    let tx = new Tx(rawTx);
    let hash = Buffer.from(tx.hash(false)).toString("hex");
    hash = hash.indexOf("0x") === 0 ? hash : "0x" + hash;

    console.info("MsgHash", r.MsgHash[0]);
    console.info("hash", hash);
    if (hash !== r.MsgHash[0]) {
      console.info("比对hash", true);
      message.error("Error: hash");
    }
    // const tx = new Tx(rawTx);
    let signTx = tx.serialize().toString("hex");
    signTx = signTx.indexOf("0x") === 0 ? signTx : "0x" + signTx;
    console.info("txhash", tx.hash().toString("hex"));
    // // const Rsv = JSON.parse(r.Rsv).Rsv[0];
    // const v = Number(56) * 2 + 35 + Number(Rsv.substr(128, 2)) - 27
    // tx.r = "0x" + Rsv.substr(0, 64);
    // tx.s = "0x" + Rsv.substr(64, 64);
    // tx.v = web3.utils.toHex(v);
    // // end
    // // tx.v = "0x" + result.v;
    // // let signTx = tx.serialize().toString("hex");
    // signTx = signTx.indexOf("0x") === 0 ? signTx : "0x" + signTx;

    // let hash = Buffer.from(tx.hash(false)).toString("hex");
    // hash = hash.indexOf("0x") === 0 ? hash : "0x" + hash;

    web3.eth
      .sendSignedTransaction(signTx)
      .then((res: any) => {
        console.log("sendSignedTransaction", res);
        debugger;
      })
      .catch((e) => {
        debugger;
      });
    debugger;
    // const res = await web3.eth.sendSignedTransaction(signTx);;
    // console.info('res', res)
  };

  const columns = [
    {
      title: "from",
      dataIndex: "MsgContext",
      render: (t: any) => cutOut(t.from, 6, 4),
    },
    {
      title: "to",
      dataIndex: "MsgContext",
      render: (t: any) => cutOut(t.to, 6, 4),
    },
    {
      title: "value",
      dataIndex: "MsgContext",
      render: (t: any) => t.value,
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
      render: (r: any) => {
        return <a onClick={() => send(r)}>发到链上</a>;
      },
    },
  ];

  return (
    <div className="approval">
      {/* <Button onClick={getApproveList}>get</Button>{" "} */}
      <Table
        columns={columns}
        dataSource={JSON.parse(localStorage.getItem("sendApprovaled") || "[]")}
        pagination={false}
      />
    </div>
  );
};

export default Index;
