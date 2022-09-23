import React, { useEffect, useState } from "react";
import { Button, message, Table, Tag, Collapse, Breadcrumb } from "antd";
import { useActiveWeb3React } from "@/hooks";
import { useModel, useIntl } from "umi";
import moment from "moment";
import "./style.less";
import { cutOut } from "@/utils";
import { SettingOutlined } from "@ant-design/icons";

const Index = () => {
  const { globalDispatch, Account } = useModel(
    "global",
    ({ globalDispatch, Account }) => ({
      globalDispatch,
      Account,
    })
  );

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
  const createGrounpModel = useIntl().formatHTMLMessage({
    id: "createGrounp.model",
  });
  const gAction = useIntl().formatHTMLMessage({ id: "g.action" });

  const columns = [
    {
      title: "Initiator",
      dataIndex: "From",
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
      dataIndex: "AllReply",
      width: "32%",
      render: (t: any) =>
        t.map((item: any) => (
          <p key={item.Approver}>
            {item.Approver}:{"  "}
            {item.Status}
          </p>
        )),
    },
    {
      title: "Status",
      dataIndex: "Status",
      width: "25%",
      render: (t: any, r: any) => {
        return (
          <div>
            {t}
            {r.Error && <p>Reason: {r.Error}</p>}
          </div>
        );
      },
    },
  ];

  return (
    <div className="approval">
      {/* <Button onClick={getApproveList}>get</Button>{" "} */}
      <Breadcrumb className="mt15">
        <Breadcrumb.Item>Account</Breadcrumb.Item>
        <Breadcrumb.Item>History</Breadcrumb.Item>
      </Breadcrumb>
      <Table
        columns={columns}
        rowKey="KeyID"
        dataSource={Account}
        pagination={false}
        scroll={{ y: "calc(100vh - 220px)" }}
      />
    </div>
  );
};

export default Index;
