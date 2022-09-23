import React, { useEffect, useState } from "react";
import { Button, message, Table, Breadcrumb } from "antd";
import { useActiveWeb3React } from "@/hooks";
import { RedoOutlined } from "@ant-design/icons";
import { useApproveReqSmpcAddress } from "@/hooks/useSigns";
import { useModel, useIntl } from "umi";
import moment from "moment";
import web3 from "@/assets/js/web3";
import "./style.less";
import { cutOut, copyTxt } from "@/utils";

const Index = () => {
  const { account } = useActiveWeb3React();
  const [spin, setSpin] = useState(false);
  const { globalDispatch, pollingPubKey, Account, accountApprovalHaveHandled } =
    useModel(
      "global",
      ({
        globalDispatch,
        pollingPubKey,
        Account,
        accountApprovalHaveHandled,
      }: any) => ({
        globalDispatch,
        pollingPubKey,
        Account,
        accountApprovalHaveHandled,
      })
    );
  const { approveList, approveListLoading, getData } = useModel(
    "approval",
    ({ approveList, approveListLoading, getData }: any) => ({
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
  const createGrounpModel = useIntl().formatHTMLMessage({
    id: "createGrounp.model",
  });
  const gAction = useIntl().formatHTMLMessage({ id: "g.action" });
  const approvalAgree = useIntl().formatHTMLMessage({ id: "approval.agree" });
  const approvalDisagree = useIntl().formatHTMLMessage({
    id: "approval.disagree",
  });
  const createYourOwn = useIntl().formatHTMLMessage({ id: "createYourOwn" });

  const refresh = () => {
    setSpin(true);
    getData();
    setTimeout(() => {
      setSpin(false);
    }, 500);
  };

  const columns: any = [
    {
      title: "Initiator",
      dataIndex: "Account",
      render: (t: string) => cutOut(t, 6, 4),
    },
    {
      title: "GroupID",
      dataIndex: "GroupID",
      render: (t: string) => cutOut(t, 6, 4),
    },
    // {
    //   title: "Key",
    //   dataIndex: "Key",
    //   render: (t: string) => (
    //     <a onClick={() => copyTxt(t)}>{cutOut(t, 6, 4)}</a>
    //   ),
    // },
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
      render: (r: any, i: number) => (
        <span>
          {account === r.Account ? (
            <span>{createYourOwn}</span>
          ) : (
            <span>
              <Button
                type="primary"
                onClick={() => approve(r, "AGREE")}
                className="mr8"
              >
                {approvalAgree}
              </Button>
              <Button onClick={() => approve(r, "DISAGREE")}>
                {approvalDisagree}
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
      localStorage.setItem(
        "accountApprovalHaveHandled",
        JSON.stringify([...accountApprovalHaveHandled, r.TimeStamp])
      );
      globalDispatch({
        accountApprovalHaveHandled: [
          ...accountApprovalHaveHandled,
          r.TimeStamp,
        ],
      });
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

      const newAccount = [
        {
          AllReply: [
            {
              Approver: account,
              Status: type,
            },
          ],
          From: account,
          GroupID: r.GroupID,
          KeyID: r.Key,
          PubKey: "",
          Status: "Pending",
          ThresHold: r.ThresHold,
          TimeStamp: r.TimeStamp,
        },
        ...Account,
      ];
      localStorage.setItem("Account", JSON.stringify(Account));
      globalDispatch({
        Account: newAccount,
      });

      debugger;
    } else if (res?.msg) {
      message.error(res.msg);
    }
  };

  return (
    <div className="approval">
      <Breadcrumb className="mt15">
        <Breadcrumb.Item>Account</Breadcrumb.Item>
        <Breadcrumb.Item>Approval</Breadcrumb.Item>
      </Breadcrumb>
      <RedoOutlined
        spin={spin}
        className="fs18 cursor_pointer fr mb10 mr5"
        onClick={refresh}
      />
      <Table
        columns={columns}
        dataSource={approveList.filter((item) =>
          accountApprovalHaveHandled.every((it) => it !== item.TimeStamp)
        )}
        loading={approveListLoading}
        pagination={false}
        rowKey="Key"
        scroll={{ y: "calc(100vh - 220px)" }}
      />
    </div>
  );
};

export default Index;
