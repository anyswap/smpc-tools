import { Table, Button, message } from "antd";
import React from "react";
import { acceptSign } from "@/hooks/useSigns";
import { useIntl, useModel } from "umi";
import { useActiveWeb3React } from "@/hooks";
import { cutOut } from "@/utils";
import moment from "moment";

const Index = () => {
  const { rpc } = JSON.parse(localStorage.getItem("loginAccount") || "{}");
  const { execute } = acceptSign(rpc);
  const { account } = useActiveWeb3React();
  const { tradingList, tradingListLoading, getData, globalDispatch } = useModel(
    "approval",
    ({ tradingList, tradingListLoading, getData, globalDispatch }: any) => ({
      tradingList,
      tradingListLoading,
      getData,
      globalDispatch,
    })
  );

  const action = async (Accept: string, r: any) => {
    if (!execute) return;
    const res = await execute(Accept, r);
    if (res?.Status === "Success") {
      message.success("Success");
      // const approvaled = JSON.parse(
      //   localStorage.getItem("tradingApprovaled") || "[]"
      // );
      // localStorage.setItem(
      //   "tradingApprovaled",
      //   JSON.stringify([{ ...r, status: Accept }, ...approvaled])
      // );
      getData();

      const historyPollingRsv = JSON.parse(
        localStorage.getItem("pollingRsv") || "[]"
      ).filter((item: any) => item.params[0] !== r.Key);
      globalDispatch({
        pollingRsv: [
          {
            fn: "getSignStatus",
            params: [r.Key],
          },
          ...historyPollingRsv,
        ],
      });
      localStorage.setItem(
        "pollingRsv",
        JSON.stringify([
          { fn: "getSignStatus", params: [r.Key] },
          ...historyPollingRsv,
        ])
      );
      return;
    }
    message.error("Error");
  };

  const columns: any = [
    {
      title: "Key",
      dataIndex: "Key",
      render: (t: string) => (
        <a onClick={() => copyTxt(t)}>{cutOut(t, 6, 8)}</a>
      ),
    },
    {
      title: "Account",
      dataIndex: "Account",
      render: (t: string) => cutOut(t, 6, 8),
    },
    {
      title: "KeyType",
      dataIndex: "KeyType",
    },
    {
      title: "Rsv",
      dataIndex: "Raw",
      render: (t: string) => cutOut(JSON.parse(t).Rsv, 6, 8),
    },
    {
      title: "PubKey",
      dataIndex: "PubKey",
      render: (t: string) => cutOut(t, 6, 8),
    },
    {
      title: useIntl().formatHTMLMessage({ id: "createGrounp.model" }),
      dataIndex: "ThresHold",
    },
    {
      title: "TimeStamp",
      dataIndex: "TimeStamp",
      render: (t: string) => moment(Number(t)).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: useIntl().formatHTMLMessage({ id: "g.action" }),
      render: (r: any, i: number) =>
        account === r.Account ? (
          <span>自己创建</span>
        ) : (
          <span>
            <Button
              onClick={() => action("AGREE", r)}
              className="mr8"
              type="primary"
            >
              {useIntl().formatHTMLMessage({ id: "approval.agree" })}
            </Button>
            <Button onClick={() => action("DISAGREE", r)}>
              {useIntl().formatHTMLMessage({ id: "approval.disagree" })}
            </Button>
          </span>
        ),
    },
  ];
  return (
    <Table
      columns={columns}
      dataSource={tradingList}
      loading={tradingListLoading}
      pagination={false}
    />
  );
};

export default Index;
