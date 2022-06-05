import React, { useEffect, useState } from "react";
import { Button, Modal, Table } from "antd";
import { useIntl, useModel } from "umi";
import web3 from "@/assets/js/web3";
import { useActiveWeb3React } from "@/hooks";
import moment from "moment";

const Index = () => {
  // const {
  //   loginAccount: { rpc, signEnode },
  // } = useModel("global", ({ loginAccount }) => ({
  //   loginAccount,
  // }));
  const { rpc, signEnode } = JSON.parse(
    localStorage.getItem("loginAccount") || "{}"
  );
  const { account } = useActiveWeb3React();
  const [data, setData] = useState([]);

  const columns = [
    {
      title: "pubicKey",
      dataIndex: "PubKey",
      width: "50%",
    },
    {
      title: useIntl().formatHTMLMessage({ id: "accountList.createDate" }),
      dataIndex: "TimeStamp",
      render: (t: string, r) => r,
      render: (t: string) => moment(Number(t)).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: useIntl().formatHTMLMessage({ id: "accountList.thresHold" }),
      dataIndex: "ThresHold",
      width: "20%",
    },
  ];

  const getAccountList = async () => {
    if (!rpc || !account) return;
    web3.setProvider(rpc);
    const res = await web3.smpc.getAccounts(account, "0");
    const { Group = [] } = res.Data.result;
    let arr: any = [];
    Group.forEach((item: any) => {
      item.Accounts.forEach((it: any) => {
        if (arr.every((el: any) => el.PubKey !== it.PubKey)) {
          arr.push({
            PubKey: it.PubKey,
            GroupID: item.GroupID,
            ThresHold: it.ThresHold,
            // name: it.publicKey.substr(2),
            TimeStamp: Number(it.TimeStamp),
          });
        }
      });
    });
    setData(arr.sort((a, b) => b.TimeStamp - a.TimeStamp));
  };

  useEffect(() => {
    getAccountList();
  }, []);

  const viewSignEnode = () => {
    Modal.info({
      icon: null,
      content: signEnode,
    });
  };

  return (
    <div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="PubKey"
        pagination={false}
      />
    </div>
  );
};

export default Index;
