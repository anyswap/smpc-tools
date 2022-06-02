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
  const { account } = useActiveWeb3React();
  const { signMessage } = useSign();

  // const {
  //   loginAccount: { rpc },
  // } = useModel("global", ({ loginAccount }) => ({
  //   loginAccount,
  // }));
  const { rpc } = JSON.parse(localStorage.getItem("loginAccount") || "{}");
  const { execute } = useApproveReqSmpcAddress(rpc);
  const [data, setData] = useState([]);

  const getApproveList = async () => {
    if (!rpc || !account) return;
    web3.setProvider(rpc);
    const res = await web3.smpc.getCurNodeReqAddrInfo(account);
    setData(res.Data);
  };

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
      render: (t: string) => moment(Number(t)).format("YYYY-MM-DD HH:MM:SS"),
    },
    {
      title: "ThresHold",
      dataIndex: "ThresHold",
    },
    {
      title: useIntl().formatHTMLMessage({ id: "g.action" }),
      render: (r: any) => (
        <span>
          <Button onClick={() => approve(r.Key, "AGREE")} className="mr8">
            {useIntl().formatHTMLMessage({ id: "approval.agree" })}
          </Button>
          <Button onClick={() => approve(r.Key, "DISAGREE")}>
            {useIntl().formatHTMLMessage({ id: "approval.disagree" })}
          </Button>
        </span>
      ),
    },
  ];
  const operationIsSuccessful = useIntl().formatMessage({
    id: "operationIsSuccessful",
  });
  const approve = async (key: string, type: string) => {
    if (!execute) return;
    const res = await execute(key, type);
    if (res?.info === "Success") {
      message.success(operationIsSuccessful);
      getApproveList();
    } else {
      message.error(res.msg);
    }
  };

  return (
    <div className="approval">
      {/* <Button onClick={getApproveList}>get</Button>{" "} */}
      <Table columns={columns} dataSource={data} pagination={false} />
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
