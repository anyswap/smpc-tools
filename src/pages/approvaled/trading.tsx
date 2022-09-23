import React, { useEffect, useState } from "react";
import {
  Button,
  message,
  Table,
  Tag,
  Spin,
  Modal,
  Collapse,
  Timeline,
  Breadcrumb,
  Empty,
} from "antd";
import { useActiveWeb3React } from "@/hooks";
import { useModel, history, useIntl } from "umi";
import Tx from "ethereumjs-tx";
import {
  CopyOutlined,
  PlusCircleOutlined,
  FormOutlined,
  AppstoreAddOutlined,
  RightOutlined,
  LoadingOutlined,
  ShareAltOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import moment from "moment";
import web3 from "@/assets/js/web3";
import "./style.less";
import { cutOut, getTransactionStatus } from "@/utils";
import { chainInfo } from "@/config/chainConfig";
import { ethers } from "ethers";
import { logos } from "@/pages/accountDrawer/config";

const Index = () => {
  const { account } = useActiveWeb3React();
  const action: any = {
    AGREE: useIntl().formatHTMLMessage({ id: "approval.agree" }),
    DISAGREE: useIntl().formatHTMLMessage({ id: "approval.disagree" }),
  };
  const { activeAccount } = useModel(
    "accountDrawer",
    ({ activeAccount }: any) => ({
      activeAccount,
    })
  );
  const {
    globalDispatch,
    sendApprovaled: GsendApprovaled,
    pollingRsvInfo,
    getRsv,
    getRsvSpin,
    Account,
  } = useModel(
    "global",
    ({
      globalDispatch,
      sendApprovaled,
      pollingRsvInfo,
      getRsv,
      getRsvSpin,
      Account,
    }) => ({
      globalDispatch,
      sendApprovaled,
      pollingRsvInfo,
      getRsv,
      getRsvSpin,
      Account,
    })
  );

  const [data, setData] = useState(
    JSON.parse(localStorage.getItem("sendApprovaled") || "[]")
  );

  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    getRsv();
    localStorage.setItem("pollingRsvInfo", "0");
    globalDispatch({
      pollingRsvInfo: 0,
    });
  }, []);
  const sendTo = useIntl().formatHTMLMessage({ id: "sendTo" });
  const operationIsSuccessful = useIntl().formatHTMLMessage({
    id: "operationIsSuccessful",
  });
  const transactionHash = useIntl().formatHTMLMessage({
    id: "transactionHash",
  });

  const send = async (r: any, i: any) => {
    debugger;
    // return;
    setSpinning(true);
    const MsgContext = JSON.parse(r.MsgContext[0]);
    const { TokenAddress, chainId, to, value } = MsgContext;
    console.info("chainInfo", chainInfo);
    const nodeRpc = chainInfo[web3.utils.hexToNumber(chainId)].nodeRpc;

    web3.setProvider(nodeRpc);
    // web3.setProvider("https://rinkeby.infura.io/v3/");
    // "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
    const Rsv = r.Rsv[0];
    debugger;
    const v =
      Number(web3.utils.hexToNumber(chainId)) * 2 +
      35 +
      Number(Rsv.substr(128, 2));
    let rawTx = {
      from: MsgContext.from,
      to,
      value,
      gas: MsgContext.gas,
      gasPrice: MsgContext.gasPrice,
      nonce: MsgContext.nonce,
      data: MsgContext.data,
      // r: "0x" + Rsv.substr(0, 64),
      // s: "0x" + Rsv.substr(64, 64),
      // v: web3.utils.toHex(v),
      chainId,
      TokenAddress,
    };

    let tx = new Tx(rawTx);
    let hash = Buffer.from(tx.hash(false)).toString("hex");
    hash = hash.indexOf("0x") === 0 ? hash : "0x" + hash;
    debugger;
    if (hash !== r.MsgHash[0]) {
      debugger;
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

    // const hash2 = Buffer.from(tx.hash(false)).toString("hex");
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
        debugger;
        const newData = GsendApprovaled.map((item: any, index: number) => ({
          ...item,
          transactionHash:
            index === i ? transactionHash : item.transactionHash || null,
          transactionStatus: index === i ? "Success" : "Pending",
        }));
        setData(newData);
        globalDispatch({
          sendApprovaled: newData,
        });
        localStorage.setItem("sendApprovaled", JSON.stringify(newData));
      })
      .on("receipt", function (receipt) {
        message.info("receipt", receipt);
      })
      .on("confirmation", function (confirmationNumber, receipt) {
        message.info(
          "confirmation",
          "confirmationNumber",
          confirmationNumber,
          "receipt",
          receipt
        );
      })
      .on("error", (e: any) => {
        setSpinning(false);
        message.error(e.message);
      });
    // .catch((e: any) => {
    //   setSpinning(false);
    //   message.error(e.message);
    // });
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
        const { chainId, data, originValue, symbol } = JSON.parse(
          r.MsgContext[0]
        );
        const chainDetial = chainInfo[web3.utils.hexToNumber(chainId)];
        // console.info("chainInfo222", chainInfo);
        // console.info("chainDetial222", chainDetial);
        // // ethers.utils.formatUnits(value, chainDetial.decimals)
        // if (data === "{}") {
        //   return originValue + chainDetial.symbol;
        //   // return web3.utils.hexToNumber(value);
        // }

        return originValue + (symbol ? symbol : chainDetial.symbol);
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
        const { chainId, name } = JSON.parse(r.MsgContext[0]);
        const chainDetial = chainInfo[web3.utils.hexToNumber(chainId)];
        if (!r.transactionHash) {
          return <a onClick={() => send(r, i)}>{sendTo + " " + name}</a>;
        }
        return (
          <Button
            onClick={() => {
              window.open(`${chainDetial.explorer}/tx/${r.transactionHash}`);
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
  const List = Account.filter((item: any) => item.Status === "Success");
  const accountSelected = List.length ? activeAccount || List[0] : null;
  console.info("accountSelectedaccountSelected", accountSelected);
  return (
    <Spin tip="Loading..." spinning={spinning}>
      <div
        className="approval bm20"
        onMouseMove={() => {
          if (pollingRsvInfo) {
            globalDispatch({
              pollingRsvInfo: 0,
            });
            localStorage.setItem("pollingPubKeyInfo", "0");
          }
        }}
      >
        <Breadcrumb className="mt15">
          <Breadcrumb.Item>Transactions</Breadcrumb.Item>
          <Breadcrumb.Item>History</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ overflow: "hidden" }}>
          <RedoOutlined
            spin={getRsvSpin}
            className="fs18 cursor_pointer fr mr15"
            onClick={getRsv}
          />
        </div>

        {/* <Button onClick={getApproveList}>get</Button>{" "} */}
        {/* <Table
          columns={columns}
          rowKey="KeyID"
          dataSource={GsendApprovaled}
          pagination={false}
        /> */}
      </div>
      {GsendApprovaled.filter(
        (item) => item.GroupID === accountSelected?.GroupID
      ).length === 0 && <Empty />}
      {GsendApprovaled.filter(
        (item) => item.GroupID === accountSelected?.GroupID
      )
        .sort((a, b) => Number(b.TimeStamp) - Number(a.TimeStamp))
        .map((item: any, index: any) => {
          const {
            TimeStamp,
            MsgContext,
            transactionStatus,
            ThresHold,
            AllReply,
            Status,
            KeyID,
          } = item;
          const { chainId, data, originValue, symbol, to, name } = JSON.parse(
            MsgContext[0]
          );
          const chainDetial = chainInfo[web3.utils.hexToNumber(chainId)];

          const isPrrovaling =
            AllReply.filter((it) => it.Status === "AGREE").length <
            Number(ThresHold.split("/")[0]);
          const isPrrovaled =
            AllReply.filter((it) => it.Status === "AGREE").length ===
            Number(ThresHold.split("/")[0]);
          return (
            <Collapse
              expandIconPosition="end"
              key={TimeStamp}
              onChange={(e) => {
                getRsv();
                if (e.length) getTransactionStatus(item, index);
              }}
            >
              <Collapse.Panel
                expandIconPosition="end"
                key={TimeStamp}
                header={
                  <div>
                    <span style={{ display: "inline-block", width: "28%" }}>
                      <span>
                        {index + 1} Sent &nbsp;
                        <img
                          src={require("./img/send.svg")}
                          style={{ marginBottom: 2 }}
                        />
                      </span>
                    </span>
                    <span style={{ display: "inline-block", width: "28%" }}>
                      <img
                        width={26}
                        src={logos[symbol || chainDetial.symbol]}
                      />
                      &nbsp;
                      {originValue}
                      {symbol || chainDetial.symbol}
                    </span>
                    <span style={{ display: "inline-block", width: "28%" }}>
                      {moment(Number(TimeStamp)).format("YYYY-MM-DD HH:mm:ss")}
                    </span>
                    <span className="sta">
                      {/* {item.transactionHash ? "Success" : "Pending"} */}
                      {Status == "Failure"
                        ? "Failure"
                        : transactionStatus || "Pending"}
                    </span>
                  </div>
                }
              >
                <div className="collapse-content">
                  <div className="left">
                    <p>
                      Sent{" "}
                      <b>{` ${originValue} ${
                        symbol || chainDetial.symbol
                      } `}</b>
                      to:
                      <b>{` ${to}`}</b>
                      {!item.transactionHash && Status == "Success" && (
                        <Button
                          onClick={() => send(item, index)}
                          type="primary"
                          style={{ marginLeft: 20 }}
                        >
                          {sendTo + " " + name}
                        </Button>
                      )}
                    </p>
                    {AllReply.map((item) => (
                      <div key={item.Approver}>
                        {item.Approver}: {item.Status}
                      </div>
                    ))}
                    {item.transactionHash && (
                      <div className="mt20">
                        Transaction hash: {getTransactionStatus(item)}
                        <ShareAltOutlined
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            // dataIndex: "Status",
                            // render: (t: any, r: any, i: any) => {
                            //   if (t !== "Success") return "--";
                            const { chainId, name } = JSON.parse(
                              item.MsgContext[0]
                            );
                            const chainDetial =
                              chainInfo[web3.utils.hexToNumber(chainId)];
                            window.open(
                              `${
                                chainDetial.explorer
                              }/tx/${getTransactionStatus(item)}`
                            );
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="right">
                    <Timeline>
                      <Timeline.Item key={0}>
                        Create a transaction site{" "}
                        {moment(Number(TimeStamp)).format(
                          "YYYY-MM-DD HH:mm:ss"
                        )}
                      </Timeline.Item>
                      <Timeline.Item
                        key={1}
                        dot={
                          isPrrovaling &&
                          !["Failure"].includes(Status) && <LoadingOutlined />
                        }
                        color={isPrrovaled ? "blue" : "gray"}
                        // color={
                        //   !["Failure"].includes(Status) ||
                        //   transactionStatus !== "Success"
                        //     ? "gray"
                        //     : "blue"
                        // }
                      >
                        Aprrovaling
                      </Timeline.Item>
                      <Timeline.Item
                        key={2}
                        dot={
                          transactionStatus !== "Success" &&
                          isPrrovaled && <LoadingOutlined />
                        }
                        color={
                          transactionStatus !== "Success" ? "gray" : "blue"
                        }
                      >
                        {sendTo + " " + name}
                      </Timeline.Item>
                      <Timeline.Item
                        key={3}
                        color={
                          transactionStatus !== "Success" ? "gray" : "blue"
                        }
                      >
                        Done
                      </Timeline.Item>
                    </Timeline>
                    {transactionStatus === "Success" && (
                      <Button
                        onClick={() => {
                          // dataIndex: "Status",
                          // render: (t: any, r: any, i: any) => {
                          //   if (t !== "Success") return "--";
                          const { chainId, name } = JSON.parse(
                            item.MsgContext[0]
                          );
                          const chainDetial =
                            chainInfo[web3.utils.hexToNumber(chainId)];
                          window.open(
                            `${chainDetial.explorer}/tx/${getTransactionStatus(
                              item
                            )}`
                          );
                        }}
                      >
                        Transaction detail
                      </Button>
                    )}
                  </div>
                </div>
              </Collapse.Panel>
            </Collapse>
          );
        })}
    </Spin>
  );
};

export default Index;
