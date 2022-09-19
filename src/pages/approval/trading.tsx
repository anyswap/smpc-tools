import { Table, Button, message, Breadcrumb } from "antd";
import React, { useState } from "react";
import { acceptSign } from "@/hooks/useSigns";
import { useIntl, useModel } from "umi";
import { cutOut, copyTxt } from "@/utils";
import { RedoOutlined } from "@ant-design/icons";
import moment from "moment";
import { chainInfo } from "@/config/chainConfig";
import { useActiveWeb3React } from "@/hooks";
import web3 from "@/assets/js/web3";

const Index = () => {
  const { rpc } = JSON.parse(localStorage.getItem("loginAccount") || "{}");
  const { account } = useActiveWeb3React();
  const { execute } = acceptSign(rpc);
  const [spin, setSpin] = useState(false);
  const { tradingList, tradingListLoading, getData } = useModel(
    "approval",
    ({ tradingList, tradingListLoading, getData }: any) => ({
      tradingList,
      tradingListLoading,
      getData,
    })
  );

  const { globalDispatch } = useModel("global", ({ globalDispatch }: any) => ({
    globalDispatch,
  }));

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
  const createGrounpModel = useIntl().formatHTMLMessage({
    id: "createGrounp.model",
  });
  const approvalAgree = useIntl().formatHTMLMessage({ id: "approval.agree" });
  const approvalDisagree = useIntl().formatHTMLMessage({
    id: "approval.disagree",
  });
  const createYourOwn = useIntl().formatHTMLMessage({ id: "createYourOwn" });
  const columns: any = [
    // {
    //   title: "Key",
    //   dataIndex: "Key",
    //   render: (t: string) => (
    //     <a onClick={() => copyTxt(t)}>{cutOut(t, 6, 8)}</a>
    //   ),
    // },
    {
      title: "Initiator",
      dataIndex: "Account",
      render: (t: string) => <span title={t}>{cutOut(t, 6, 8)}</span>,
    },
    {
      title: "To",
      dataIndex: "MsgContext",
      render: (t: string) => {
        const MsgContext = JSON.parse(t[0]);
        return <span title={MsgContext.to}>{cutOut(MsgContext.to, 6, 8)}</span>;
      },
    },
    {
      title: "Value",
      dataIndex: "MsgContext",
      render: (t: string) => {
        const { chainId, originValue, symbol } = JSON.parse(t[0]);
        const chainDetial = chainInfo[web3.utils.hexToNumber(chainId)];
        return (
          <span title={originValue}>
            {originValue}
            {symbol ? symbol : chainDetial.symbol}
          </span>
        );
      },
    },
    {
      title: "Mpc Type",
      dataIndex: "KeyType",
    },
    // {
    //   title: "RSV",
    //   dataIndex: "Raw",
    //   render: (t: string) => cutOut(JSON.parse(t).Rsv, 6, 8),
    // },
    // {
    //   title: "PubKey",
    //   dataIndex: "PubKey",
    //   render: (t: string) => cutOut(t, 6, 8),
    // },
    // {
    //   title: createGrounpModel,
    //   dataIndex: "ThresHold",
    // },
    {
      title: "TimeStamp",
      dataIndex: "TimeStamp",
      render: (t: string) => moment(Number(t)).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: useIntl().formatHTMLMessage({ id: "g.action" }),
      render: (r: any, i: number) =>
        r.Account === account ? (
          <span>{createYourOwn}</span>
        ) : (
          <span>
            <Button
              onClick={() => action("AGREE", r)}
              className="mr8"
              type="primary"
            >
              {approvalAgree}
            </Button>
            <Button onClick={() => action("DISAGREE", r)}>
              {approvalDisagree}
            </Button>
          </span>
        ),
    },
  ];
  const refresh = () => {
    setSpin(true);
    getData();
    setTimeout(() => {
      setSpin(false);
    }, 500);
  };
  return (
    <>
      <Breadcrumb className="mt15">
        <Breadcrumb.Item>Transactions</Breadcrumb.Item>
        <Breadcrumb.Item>Approval</Breadcrumb.Item>
      </Breadcrumb>
      <RedoOutlined
        spin={spin}
        className="fs18 cursor_pointer fr mb10 mr5"
        onClick={refresh}
      />
      <Table
        columns={columns}
        dataSource={tradingList}
        loading={tradingListLoading}
        pagination={false}
        rowKey="Key"
      />
    </>
  );
};

export default Index;
