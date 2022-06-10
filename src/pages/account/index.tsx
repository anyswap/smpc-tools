import React, { useEffect, useMemo, useState } from "react";
import { Button, message, Modal, Table } from "antd";
import { useIntl, useModel } from "umi";
import web3 from "@/assets/js/web3";
// import web3Fn from "@/libs/web3/index.js";
import { useActiveWeb3React } from "@/hooks";
import { useGetSign } from "@/hooks/useSigns";
import moment from "moment";
import { cutOut } from "@/utils";
const keccak256 = require("js-sha3").keccak256;

const Index = () => {
  const { rpc, signEnode } = JSON.parse(
    localStorage.getItem("loginAccount") || "{}"
  );
  const { execute } = useGetSign(rpc);
  const { account } = useActiveWeb3React();

  const [data, setData] = useState([]);
  const [details, setDetails] = useState<any>("{}");

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
        return <span>{JSON.parse(details)[t]?.SmpcAddress?.ETH}</span>;
      },
    },
    {
      title: useIntl().formatHTMLMessage({ id: "balance" }),
      dataIndex: "PubKey",
      width: "10%",
      render: (t: string) => JSON.parse(details)[t]?.balance,
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
      title: useIntl().formatHTMLMessage({ id: "g.action" }),
      width: "10%",
      render: (r: any) => (
        <a
          onClick={async () => {
            if (!execute) return;
            const res = await execute(r, details["PubKey"]?.SmpcAddress?.ETH);
            if (res.Status === "Success") message.success("Success");
          }}
        >
          {useIntl().formatHTMLMessage({ id: "transaction" })}
        </a>
      ),
    },
  ];

  const detailsObj: any = {};
  const getSmpcAddr = async (PubKey: string, newArr: Array<any>) => {
    const res = await web3.smpc.getSmpcAddr(PubKey);
    web3.setProvider("https://api.mycryptoapi.com/eth");
    const balanceRes = await web3.eth.getBalance(
      JSON.parse(res.Data.result).SmpcAddress.ETH
    );
    detailsObj[PubKey] = {
      balance: balanceRes + "eth",
      SmpcAddress: JSON.parse(res.Data.result).SmpcAddress,
    };
    if (
      Object.entries(detailsObj).length === Object.entries(detailsObj).length
    ) {
      setDetails(JSON.stringify(detailsObj));
    }
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
    setData(arr.sort((a: any, b: any) => b.TimeStamp - a.TimeStamp));
    const newArr = Array.from(new Set(arr.map((item: any) => item.PubKey)));
    newArr.forEach((item) => {
      getSmpcAddr(item as string, newArr);
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

  // return useMemo(() => {
  return (
    <div>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowKey="PubKey"
        key={Object.values(details).length}
      />
    </div>
  );
  // }, [account, data, JSON.stringify(details), details]);
};

export default Index;
