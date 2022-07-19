import React, { useEffect, useState } from "react";
import { Button, message, Table, Tag } from "antd";
import { useActiveWeb3React } from "@/hooks";
import { useModel, useIntl } from "umi";
import moment from "moment";
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
      title: "Status",
      dataIndex: "Status",
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
      dataIndex: "AllReply",
      render: (t: any) => t.map((item: any) => <p>{item.Status}</p>),
    },
  ];

  return (
    <div className="approval">
      {/* <Button onClick={getApproveList}>get</Button>{" "} */}
      <Table
        columns={columns}
        rowKey="PubKey"
        dataSource={JSON.parse(localStorage.getItem("Account") || "[]")}
        pagination={false}
      />
    </div>
  );
};

export default Index;
