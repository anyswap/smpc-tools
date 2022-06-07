import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal, Table } from "antd";
import { useIntl, useModel } from "umi";
import web3 from "@/assets/js/web3";
// import web3Fn from "@/libs/web3/index.js";
import { useActiveWeb3React } from "@/hooks";
import moment from "moment";
import { cutOut } from "@/utils";
const keccak256 = require("js-sha3").keccak256;

const Index = () => {
  const { rpc, signEnode } = JSON.parse(
    localStorage.getItem("loginAccount") || "{}"
  );
  const { account } = useActiveWeb3React();
  const [data, setData] = useState([]);
  const [details, setDetails] = useState<any>({});

  const columns = [
    {
      title: "pubicKey",
      dataIndex: "PubKey",
      width: "25%",
      render: (t: string) => cutOut(t, 8, 10),
    },
    {
      title: "address",
      dataIndex: "PubKey",
      width: "25%",
      render: (t: string) => {
        return details[t]?.SmpcAddress?.ETH;
      },
    },
    {
      title: "余额",
      dataIndex: "PubKey",
      width: "10%",
      render: (t: string) => details[t]?.balance,
    },
    {
      title: useIntl().formatHTMLMessage({ id: "accountList.createDate" }),
      dataIndex: "TimeStamp",
      render: (t: string) => moment(Number(t)).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: useIntl().formatHTMLMessage({ id: "accountList.thresHold" }),
      dataIndex: "ThresHold",
      width: "10%",
    },
    {
      title: "发起交易",
      dataIndex: "ThresHold",
      width: "10%",
      render: () => <a>发起交易</a>,
    },
  ];

  const getSmpcAddr = async (PubKey: string) => {
    const res = await web3.smpc.getSmpcAddr(PubKey);
    web3.setProvider("https://api.mycryptoapi.com/eth");
    const balanceRes = await web3.eth.getBalance(
      JSON.parse(res.Data.result).SmpcAddress.ETH
    );
    setDetails({
      ...details,
      [PubKey]: {
        balance: balanceRes + "eth",
        SmpcAddress: JSON.parse(res.Data.result).SmpcAddress,
      },
    });
  };

  const getAccountList = async () => {
    if (!rpc || !account) return;
    web3.setProvider(rpc);
    // const nonce = await getNonce(account, rpc);
    // const result = await signMessage(hash);
    const res = await web3.smpc.getAccounts(account, "0");
    const { Group = [] } = res.Data.result;
    let arr: any = [];
    Group.forEach((item: any) => {
      item.Accounts.forEach((it: any) => {
        // if (arr.every((el: any) => el.PubKey !== it.PubKey)) {
        arr.push({
          PubKey: it.PubKey,
          GroupID: item.GroupID,
          ThresHold: it.ThresHold,
          // name: it.publicKey.substr(2),
          TimeStamp: Number(it.TimeStamp),
        });
        // }
      });
    });
    setData(arr.sort((a: any, b: any) => b.TimeStamp - a.TimeStamp));
    Array.from(new Set(arr.map((item: any) => item.PubKey))).forEach((item) => {
      getSmpcAddr(item as string);
    });
  };

  useEffect(() => {
    getAccountList();
    // getAccountsBalance()
  }, []);

  const viewSignEnode = () => {
    Modal.info({
      icon: null,
      content: signEnode,
    });
  };

  return useMemo(() => {
    return (
      <div>
        <Table columns={columns} dataSource={data} pagination={false} />
      </div>
    );
  }, [account, data, JSON.stringify(details)]);
};

export default Index;
