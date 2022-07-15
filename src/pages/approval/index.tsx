import React, { useEffect, useState } from "react";
import { Button, message, Table } from "antd";
import { useActiveWeb3React } from "@/hooks";
import { useApproveReqSmpcAddress } from "@/hooks/useSigns";
import { useModel, useIntl } from "umi";
import moment from "moment";
import web3 from "@/assets/js/web3";
import "./style.less";
import { cutOut, copyTxt } from "@/utils";

const Index = () => {
  const { account } = useActiveWeb3React();

  const { globalDispatch, pollingPubKey, Account } = useModel(
    "global",
    ({ globalDispatch, pollingPubKey, Account }: any) => ({
      globalDispatch,
      pollingPubKey,
      Account,
    })
  );
  const { approveList, approveListLoading, getData } = useModel(
    "approval",
    ({ approveList, approveListLoading, getData }) => ({
      approveList,
      approveListLoading,
      getData,
    })
  );

  const { rpc } = JSON.parse(localStorage.getItem("loginAccount") || "{}");
  const { execute } = useApproveReqSmpcAddress(rpc);
  // const [data, setData] = useState([]);

  // const getApproveList = async () => {
  //   if (!rpc || !account) return;
  //   web3.setProvider(rpc);
  //   const res = await web3.smpc.getCurNodeReqAddrInfo(account);
  //   const { Data } = res;
  //   setData(
  //     (Data || []).sort(
  //       (a: any, b: any) => Number(b.TimeStamp) - Number(a.TimeStamp)
  //     )
  //   );
  // };

  // useEffect(() => {
  //   getApproveList();
  // }, [account, Account]);

  const columns: any = [
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
      render: (t: string) => (
        <a onClick={() => copyTxt(t)}>{cutOut(t, 6, 4)}</a>
      ),
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
      render: (r: any, i: number) => (
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

  const operationIsSuccessful = useIntl().formatMessage({
    id: "operationIsSuccessful",
  });
  const approve = async (r: any, type: string) => {
    if (!execute) return;
    const res = await execute(r, type);
    if (res?.info === "Success") {
      message.success(operationIsSuccessful);
      getData();
      const newPollingPubKeyItem = {
        fn: "getReqAddrStatus",
        params: [r.Key],
        data: {
          GroupID: r.GroupID,
          ThresHold: r.ThresHold,
          Key: r.Key,
        },
      };
      globalDispatch({
        pollingPubKey: [
          newPollingPubKeyItem,
          ...pollingPubKey.filter((item: any) => item.data.Key !== r.Key),
        ],
      });
      localStorage.setItem(
        "pollingPubKey",
        JSON.stringify([
          newPollingPubKeyItem,
          // ...pollingPubKey.filter((item: any) => item.data.Key !== r.Key),
          ...JSON.parse(localStorage.getItem("pollingPubKey") || "[]").filter(
            (item: any) => item.data.Key !== r.Key
          ),
        ])
      );
    } else if (res?.msg) {
      message.error(res.msg);
    }
  };

  return (
    <div className="approval">
      <Table
        columns={columns}
        dataSource={approveList}
        loading={approveListLoading}
        pagination={false}
        rowKey="Key"
      />
    </div>
  );
};

export default Index;
