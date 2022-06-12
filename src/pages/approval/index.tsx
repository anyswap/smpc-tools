import React, { useEffect, useState } from "react";
import { Button, message, Table } from "antd";
import { useActiveWeb3React } from "@/hooks";
import { useApproveReqSmpcAddress, useSign, getNonce } from "@/hooks/useSigns";
import { useModel, history, useIntl } from "umi";
import moment from "moment";
import web3 from "@/assets/js/web3";
import "./style.less";
import { cutOut } from "@/utils";

const Index = () => {
  const { account } = useActiveWeb3React();
  const { signMessage } = useSign();

  const { globalDispatch, pollingRsv } = useModel(
    "global",
    ({ globalDispatch, pollingRsv }: any) => ({
      globalDispatch,
      pollingRsv,
    })
  );
  const { rpc } = JSON.parse(localStorage.getItem("loginAccount") || "{}");
  const { execute } = useApproveReqSmpcAddress(rpc);
  const [data, setData] = useState([]);

  const getApproveList = async () => {
    if (!rpc || !account) return;
    web3.setProvider(rpc);
    const res = await web3.smpc.getCurNodeReqAddrInfo(account);
    const { Data } = res;
    setData(
      (Data || []).sort((a, b) => Number(b.TimeStamp) - Number(a.TimeStamp))
    );
  };
  console.info("account", account);
  useEffect(() => {
    getApproveList();
  }, [account]);

  const columns = [
    {
      title: "Account",
      dataIndex: "Account",
      render: (t: string) => cutOut(t, 6, 4),
    },
    {
      title: "GroupID",
      dataIndex: "GroupID",
      render: (t: string) => cutOut(t, 6, 4),
    },
    {
      title: "Key",
      dataIndex: "Key",
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
      title: "Nonce",
      dataIndex: "Nonce",
    },
    {
      title: useIntl().formatHTMLMessage({ id: "g.action" }),
      render: (r: any, i) => (
        <span>
          {account === r.Account ? (
            <span>自己创建</span>
          ) : (
            <span>
              <Button
                type="primary"
                onClick={() => approve(r, "AGREE")}
                className="mr8"
              >
                {useIntl().formatHTMLMessage({ id: "approval.agree" })}
              </Button>
              <Button onClick={() => approve(r, "DISAGREE")}>
                {useIntl().formatHTMLMessage({ id: "approval.disagree" })}
              </Button>
            </span>
          )}
        </span>
      ),
    },
  ];

  // const intervel = setInterval(async () => {
  //   const cbRsv = await web3.smpc.getSignStatus(cbData.Data?.result);
  //   console.info("cbRsv", cbRsv);
  //   debugger;
  // }, 1000);

  // const setAccount = async (r: any) => {
  //   const result = await web3.smpc.getReqAddrStatus(r.Key);
  //   debugger
  // }

  // const intervel = setInterval(async () => {
  //   const result = await web3.smpc.getReqAddrStatus(r.Key);
  //   console.info("cbRsv", cbRsv);
  //   debugger;
  // }, 1000);

  const operationIsSuccessful = useIntl().formatMessage({
    id: "operationIsSuccessful",
  });
  const approve = async (r: any, type: string) => {
    if (!execute) return;
    const res = await execute(r, type);
    if (res?.info === "Success") {
      message.success(operationIsSuccessful);
      // setAccount(r);
      getApproveList();
      const approvaled = JSON.parse(
        localStorage.getItem("accountApprovaled") || "[]"
      );
      localStorage.setItem(
        "accountApprovaled",
        JSON.stringify([{ ...r, status: type }, ...approvaled])
      );

      const newPollingPubKeyItem = {
        fn: "getReqAddrStatus",
        params: [res.info],
        data: {
          GroupID: r.GroupID,
          ThresHold: r.ThresHold,
        },
      };
      globalDispatch({
        pollingPubKey: [
          newPollingPubKeyItem,
          ...JSON.parse(localStorage.getItem("pollingPubKey") || "[]"),
        ],
      });
      localStorage.setItem(
        "pollingPubKey",
        JSON.stringify([
          newPollingPubKeyItem,
          ...JSON.parse(localStorage.getItem("pollingPubKey") || "[]"),
        ])
      );

      // const intervel = setInterval(async () => {
      //   const res = await web3.smpc.getReqAddrStatus(r.Key);
      //   if (res.Status === "Success") {
      //     const cbPkey = await web3.smpc.getReqAddrStatus(r.Key);
      //     if (cbPkey.Status === "Success") {
      //       JSON.parse(res?.Data?.result || "{}");
      //       const Account = JSON.parse(localStorage.getItem("Account") || "[]");
      //       localStorage.setItem(
      //         "Account",
      //         JSON.stringify([
      //           {
      //             ...JSON.parse(res?.Data?.result || "{}"),
      //             key: r.Key,
      //             GroupID: r.GroupID,
      //             ThresHold: r.ThresHold,
      //             PubKey: JSON.parse(cbPkey.Data.result).PubKey,
      //           },
      //           ...Account,
      //         ])
      //       );
      //       clearInterval(intervel);
      //     }
      //   }
      // }, 1000);
    } else {
      message.error(res.msg);
    }
  };

  return (
    <div className="approval">
      {/* <Button onClick={getApproveList}>get</Button>{" "} */}
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowKey="Key"
      />
      {/* {list.map((item) => (
        <div className="item" key={item.Key}>
          <div className="left">
            <div className="key">{item.Key}</div>
            <div className="enode">
              {item.Enodes.map((i) => (
                <div>{i}</div>
              ))}
            </div>
            <div className="date">{item.TimeStamp}</div>
          </div>
          <div className="right">
            {item.status ? (
              <Button type="primary">审批</Button>
            ) : (
              <Button type="primary" className="repeat">
                重审
              </Button>
            )}
          </div>
        </div>
      ))} */}
    </div>
  );
};

export default Index;
