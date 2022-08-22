import React, { useEffect, useState } from "react";
import { Button, message, Table, Tag, Spin, Modal } from "antd";
import { useActiveWeb3React } from "@/hooks";
import { useModel, history, useIntl } from "umi";
import Tx from "ethereumjs-tx";
import moment from "moment";
import web3 from "@/assets/js/web3";
import "./style.less";
import { cutOut } from "@/utils";
import { chainInfo } from "@/config/chainConfig";

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

  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    localStorage.setItem("pollingRsvInfo", "0");
    globalDispatch({
      pollingRsvInfo: 0,
    });
  }, []);
  const sendToEth = useIntl().formatHTMLMessage({ id: "sendToEth" });
  const operationIsSuccessful = useIntl().formatHTMLMessage({
    id: "operationIsSuccessful",
  });
  const transactionHash = useIntl().formatHTMLMessage({
    id: "transactionHash",
  });
  const send = async (r: any, i: any) => {
    setSpinning(true);
    const rpc =
      chainInfo[JSON.parse(r.MsgContext[0]).chainId.replace("0x", "")].nodeRpc;
    console.info(" rpc", rpc);
    console.info("r", r);
    web3.setProvider(rpc);
    // web3.setProvider("https://rinkeby.infura.io/v3/");
    // "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
    const Rsv = r.Rsv[0];
    const v =
      Number(JSON.parse(r.MsgContext[0]).chainId.replace("0x", "")) * 2 +
      35 +
      Number(Rsv.substr(128, 2));
    let rawTx = {
      from: JSON.parse(r.MsgContext[0]).from,
      to: JSON.parse(r.MsgContext[0]).to,
      value: JSON.parse(r.MsgContext[0]).value,
      gas: JSON.parse(r.MsgContext[0]).gas,
      gasPrice: JSON.parse(r.MsgContext[0]).gasPrice,
      nonce: JSON.parse(r.MsgContext[0]).nonce,
      data: JSON.parse(r.MsgContext[0]).data,
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

    const hash2 = Buffer.from(tx.hash(false)).toString("hex");
    console.info("hash2", hash2);
    // web3.eth
    //   .sendSignedTransaction(signTx)
    //   .on("receipt", (receipt) => {
    //     debugger;
    //     console.log(receipt);
    //     console.log(receipt.transactionHash);
    //   })
    //   .on("error", (e) => {
    //     debugger;
    //     console.error(e);
    //   });

    // return;
    // console.info("res1111111", res);
    // debugger;
    // const rrr = await web3.eth.sendSignedTransaction(signTx);
    // debugger;
    // console.info("rrrr", rrr);

    web3.eth
      .sendSignedTransaction(signTx)
      .on("transactionHash", function (transactionHash: any) {
        console.log("transactionHash");
        console.log(transactionHash);
        message.success(operationIsSuccessful);
        setSpinning(false);
        const newData = GsendApprovaled.map((item: any, index: number) => ({
          ...item,
          transactionHash: index === i ? transactionHash : null,
        }));
        setData(newData);
        globalDispatch({
          sendApprovaled: newData,
        });
        localStorage.setItem("sendApprovaled", JSON.stringify(newData));
      });
    // .on("receipt", function (receipt) {
    //   debugger;
    //   console.log("receipt");
    //   console.log(receipt);
    // });

    debugger;
    // web3.eth
    //   .sendSignedTransaction(signTx)
    //   .then((res) => {
    //     debugger;
    //     console.info("res", res);
    //   })
    //   .catch((e: any) => {
    //     debugger;
    //     message.error(e.message);
    //   });
    // web3.eth.sendSignedTransaction(signTx).on("receipt", (e) => {
    //   console.info("e", e);
    //   debugger;
    // });
    //     .then((res: any) => {
    //       debugger;
    //       const { transactionHash } = res.result;
    //       message.success("Send success");
    //       const newData = GsendApprovaled.map((item: any, index: number) => ({
    //         ...item,
    //         transactionHash: index === i ? transactionHash : null,
    //       }));
    //       // const newData = GsendApprovaled.filter(
    //       //   (it: any, index: number) => index !== i
    //       // );
    //       setData(newData);
    //       globalDispatch({
    //         sendApprovaled: newData,
    //       });
    //       localStorage.setItem("sendApprovaled", JSON.stringify(newData));
    //     })
    //     .catch((e: any) => {
    //       debugger;
    //       message.error(e.message);
    //     });
  };

  const createGrounpModel = useIntl().formatHTMLMessage({
    id: "createGrounp.model",
  });
  const gAction = useIntl().formatHTMLMessage({ id: "g.action" });

  const columns = [
    {
      title: "From",
      dataIndex: "MsgContext",
      render: (t: any) => cutOut(JSON.parse(t).from, 6, 4),
    },
    {
      title: "To",
      dataIndex: "MsgContext",
      render: (t: any) => cutOut(JSON.parse(t).to, 6, 4),
    },
    {
      title: "Value",
      dataIndex: "MsgContext",
      render: (t: any, r: any) => {
        const value = JSON.parse(t).value / Math.pow(10, 18);
        return (
          value +
          chainInfo[JSON.parse(r.MsgContext[0]).chainId.replace("0x", "")]
            .symbol
        );
      },
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (t: any, r: any) => {
        return (
          <div>
            {t}
            {r.Error && <p>Reason: {r.Error}</p>}
            {r.AllReply.map((item: any) => (
              <div key={item.Approver}>
                {item.Approver}:{item.Status}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: "Nonce",
      dataIndex: "MsgContext",
      render: (t: any) => JSON.parse(t[0]).nonce,
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
      title: createGrounpModel,
      dataIndex: "ThresHold",
    },

    {
      title: gAction,
      // render: (t) => action[t],
      dataIndex: "Status",
      render: (t: any, r: any, i: any) => {
        if (t !== "Success") return "--";
        if (!r.transactionHash) {
          return <a onClick={() => send(r, i)}>{sendToEth}</a>;
        }
        return (
          <Button
            onClick={() => {
              const name =
                chainInfo[JSON.parse(r.MsgContext[0]).chainId.replace("0x", "")]
                  .name;

              window.open(
                `https://${name}.etherscan.io/tx/${r.transactionHash}`
              );
              // Modal.info({
              //   title: "Transaction hash",
              //   icon: null,
              //   content: r.transactionHash,
              // })
            }}
          >
            {transactionHash}
          </Button>
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
    <Spin tip="Loading..." spinning={spinning}>
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
          rowKey="KeyID"
          dataSource={GsendApprovaled}
          pagination={false}
        />
      </div>
    </Spin>
  );
};

export default Index;
