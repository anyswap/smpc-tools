import React, { useEffect, useState } from "react";
import { Button, message, Table, Tag } from "antd";
import { useActiveWeb3React } from "@/hooks";
import { useApproveReqSmpcAddress, useSign, getNonce } from "@/hooks/useSigns";
import { useModel, history, useIntl } from "umi";
import moment from "moment";
import web3 from "@/assets/js/web3";
import "./style.less";
import { cutOut } from "@/utils";

const Index = () => {
  const { globalDispatch } = useModel("global", ({ globalDispatch }) => ({
    globalDispatch,
  }));
  useEffect(() => {
    localStorage.setItem("pollingRsvInfo", "0");
    globalDispatch({
      pollingPubKeyInfo: 0,
    });
  }, []);

  const { account } = useActiveWeb3React();
  const action: any = {
    AGREE: useIntl().formatHTMLMessage({ id: "approval.agree" }),
    DISAGREE: useIntl().formatHTMLMessage({ id: "approval.disagree" }),
  };

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
      dataIndex: "status",
      render: (t) => action[t],
    },
  ];

  return (
    <div className="approval">
      {/* <Button onClick={getApproveList}>get</Button>{" "} */}
      <Table
        columns={columns}
        dataSource={JSON.parse(
          localStorage.getItem("accountApprovaled") || "[]"
        )}
        pagination={false}
      />
    </div>
  );
};

export default Index;
