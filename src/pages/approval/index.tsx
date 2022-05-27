import React, { useEffect, useState } from "react";
import { Button, message, Table, Tag } from "antd";
import { useActiveWeb3React } from "@/hooks";
import { useApproveReqSmpcAddress } from "@/hooks/useSigns";
import { useModel, history } from "umi";
import web3 from "@/assets/js/web3";
import "./style.less";

const Index = () => {
  const { account } = useActiveWeb3React();

  const {
    loginAccount: { rpc },
  } = useModel("global", ({ loginAccount }) => ({
    loginAccount,
  }));
  const { execute } = useApproveReqSmpcAddress(rpc);
  const [data, setData] = useState([]);

  const getApproveList = async () => {
    if (!rpc || !account) return;
    web3.setProvider(rpc);
    const res = await web3.smpc.getCurNodeReqAddrInfo(account);
    console.info("getCurNodeReqAddrInfo res", res);
    setData(res.Data);
  };

  useEffect(() => {
    getApproveList();
  }, [account]);

  const columns = [
    {
      title: "Key",
      dataIndex: "Key",
    },
    {
      title: "Action",
      render: (r: any) => (
        <span>
          <Button onClick={() => approve(r.Key, "AGREE")}>Agree</Button>
          <Button onClick={() => approve(r.Key, "DISAGREE")}>Disagree</Button>
        </span>
      ),
    },
  ];

  const approve = async (key: string, type: string) => {
    if (!execute) return;
    const res = await execute(key, type);
    if (res?.result.Status === "Success") {
      message.success("Success");
      getApproveList();
    } else {
      message.error(res.result.Tip);
    }
  };

  return (
    <div className="approval">
      <Button onClick={getApproveList}>get</Button>{" "}
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
