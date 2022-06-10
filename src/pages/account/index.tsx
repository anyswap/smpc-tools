import React, { useEffect, useMemo, useState } from "react";
import { Button, message, Modal, Table, Spin } from "antd";
import { useIntl, useModel } from "umi";
import web3 from "@/assets/js/web3";
// import web3Fn from "@/libs/web3/index.js";
import { useActiveWeb3React } from "@/hooks";
import { useGetSign } from "@/hooks/useSigns";
import moment from "moment";
import { cutOut } from "@/utils";
import Send from "./component/send";
import { ethers } from "ethers";
// const keccak256 = require("js-sha3").keccak256;

const Index = () => {
  const { rpc, signEnode } = JSON.parse(
    localStorage.getItem("loginAccount") || "{}"
  );
  const { execute } = useGetSign(rpc);
  const { account } = useActiveWeb3React();

  const [data, setData] = useState([]);
  const [active, setActive] = useState<any>({});
  const [visible, setVisible] = useState<boolean>(false);
  const [spinning, setSpinning] = useState(false);
  const [details, setDetails] = useState<any>("{}");

  const columns = [
    {
      title: "pubicKey",
      dataIndex: "PubKey",
      width: "25%",
      render: (t: string) => {
        return cutOut(t, 8, 10);
      },
    },
    {
      title: "address",
      dataIndex: "PubKey",
      width: "25%",
      render: (t: string) => {
        return ethers.utils.computeAddress("0x" + t);
        // return <span>{JSON.parse(details)[t]?.SmpcAddress?.ETH}</span>;
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
          onClick={
            () => {
              setActive(r);
              setVisible(true);
            }
            //   async () => {
            //   if (!execute) return;
            //   // const res = await execute(r, details["PubKey"]?.SmpcAddress?.ETH);
            //   const res = await execute(r);
            //   if (res?.Status === "Success") message.success("Success");
            // }
          }
        >
          {useIntl().formatHTMLMessage({ id: "transaction" })}
        </a>
      ),
    },
  ];

  // const detailsObj: any = {};
  // const getSmpcAddr = async (PubKey: string, newArr: Array<any>) => {
  //   const res = await web3.smpc.getSmpcAddr(PubKey);
  //   web3.setProvider("https://api.mycryptoapi.com/eth");
  //   const balanceRes = await web3.eth.getBalance(
  //     JSON.parse(res.Data.result).SmpcAddress.ETH
  //   );
  //   detailsObj[PubKey] = {
  //     balance: balanceRes + "eth",
  //     SmpcAddress: JSON.parse(res.Data.result).SmpcAddress,
  //   };
  //   if (
  //     Object.entries(detailsObj).length === Object.entries(detailsObj).length
  //   ) {
  //     setDetails(JSON.stringify(detailsObj));
  //   }
  // };

  // const getAccountList = async () => {
  //   if (!rpc || !account) return;
  //   web3.setProvider(rpc);
  //   // const nonce = await getNonce(account, rpc);
  //   // const result = await signMessage(hash);
  //   const res = await web3.smpc.getAccounts(account, "0");
  //   const { Group = [] } = res.Data.result;
  //   let arr: any = [];
  //   Group.forEach((item: any) => {
  //     item.Accounts.forEach((it: any) => {
  //       if (arr.every((el: any) => el.PubKey !== it.PubKey)) {
  //         arr.push({
  //           PubKey: it.PubKey,
  //           GroupID: item.GroupID,
  //           ThresHold: it.ThresHold,
  //           // name: it.publicKey.substr(2),
  //           TimeStamp: Number(it.TimeStamp),
  //         });
  //       }
  //     });
  //   });
  //   setData(arr.sort((a: any, b: any) => b.TimeStamp - a.TimeStamp));
  //   const newArr = Array.from(new Set(arr.map((item: any) => item.PubKey)));
  //   newArr.forEach((item) => {
  //     getSmpcAddr(item as string, newArr);
  //   });
  // };
  const detailsObj: any = {};
  const getBalance = async (address: string, PubKey) => {
    const res = await web3.eth.getBalance(address);
    detailsObj[PubKey] = {
      balance: res + "eth",
    };
    if (
      Object.entries(detailsObj).length === Object.entries(detailsObj).length
    ) {
      setDetails(JSON.stringify(detailsObj));
    }
  };
  useEffect(() => {
    // getAccountList();
    // getAccountsBalance()

    const Account = JSON.parse(localStorage.getItem("Account") || "[]");
    web3.setProvider("https://api.mycryptoapi.com/eth");
    Account.forEach((item: any) => {
      const address = ethers.utils.computeAddress("0x" + item.PubKey);
      getBalance(address, item.PubKey);
    });
    setData(Account);
  }, [localStorage.getItem("Account")]);

  const onSend = async (to: string, value: string) => {
    if (!execute) return;
    const res = await execute(active, to, value);
    if (res.Status === "Success") message.success("Success");
  };

  // return useMemo(() => {
  return (
    <Spin tip="Loading..." spinning={spinning}>
      <div>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          rowKey="PubKey"
          key={Object.values(details).length}
        />
      </div>
      <Send visible={visible} onSend={onSend} setVisible={setVisible} />
    </Spin>
  );
  // }, [account, data, JSON.stringify(details), details]);
};

export default Index;
