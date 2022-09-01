import React, { useEffect, useMemo, useState } from "react";
import { Button, message, Modal, Table, Spin } from "antd";
import { useIntl, useModel } from "umi";
import classNames from "classnames/bind";
import web3 from "@/assets/js/web3";
// import web3Fn from "@/libs/web3/index.js";
import { useActiveWeb3React } from "@/hooks";
import { useGetSign } from "@/hooks/useSigns";
import moment from "moment";
import { cutOut, getWeb3, formatUnits } from "@/utils";
import Send from "./component/send";
import { ethers } from "ethers";
import { chainInfo } from "@/config/chainConfig";
// const keccak256 = require("js-sha3").keccak256;

const Index = () => {
  const { rpc, signEnode } = JSON.parse(
    localStorage.getItem("loginAccount") || "{}"
  );

  const {
    globalDispatch,
    Account: GAccount,
    pollingPubKeyInfo,
  } = useModel(
    "global",
    ({ globalDispatch, Account, pollingPubKeyInfo }: any) => ({
      globalDispatch,
      Account,
      pollingPubKeyInfo,
    })
  );

  const { execute } = useGetSign(rpc);
  const { account, library, chainId }: any = useActiveWeb3React();

  const [data, setData] = useState([]);
  const [active, setActive] = useState<any>({});
  const [visible, setVisible] = useState<boolean>(false);
  const [spinning, setSpinning] = useState(false);
  const [details, setDetails] = useState<any>("{}");

  useEffect(() => {
    localStorage.setItem("pollingPubKeyInfo", "0");
    globalDispatch({
      pollingPubKeyInfo: 0,
    });
  }, []);
  const intl_balance = useIntl().formatHTMLMessage({ id: "balance" });
  const intl_createDate = useIntl().formatHTMLMessage({
    id: "accountList.createDate",
  });
  const intl_thresHold = useIntl().formatHTMLMessage({
    id: "accountList.thresHold",
  });
  const intl_action = useIntl().formatHTMLMessage({ id: "g.action" });
  const intl_transaction = useIntl().formatHTMLMessage({ id: "transaction" });
  const columns = [
    {
      title: "PubKey",
      dataIndex: "PubKey",
      width: "25%",
      render: (t: string) => {
        return cutOut(t, 8, 10);
      },
    },
    {
      title: "Address",
      dataIndex: "PubKey",
      width: "25%",
      render: (t: string) => {
        return ethers.utils.computeAddress("0x" + t);
        // return <span>{JSON.parse(details)[t]?.SmpcAddress?.ETH}</span>;
      },
    },
    {
      title: intl_balance,
      dataIndex: "PubKey",
      width: "10%",
      render: (t: string) =>
        formatUnits(details[t]?.balance || 0, 18) + chainInfo[chainId].symbol,
    },
    {
      title: intl_createDate,
      dataIndex: "TimeStamp",
      render: (t: string) => moment(Number(t)).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: intl_thresHold,
      dataIndex: "ThresHold",
      width: "10%",
    },
    {
      title: intl_action,
      width: "10%",
      render: (r: any) => (
        <Button
          type="link"
          disabled={!Number(details[r["PubKey"]]?.balance)}
          onClick={
            () => {
              setActive({
                ...r,
                address: ethers.utils.computeAddress("0x" + r.PubKey),
              });
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
          {intl_transaction}
        </Button>
      ),
    },
  ];

  useEffect(() => {
    const Account = GAccount.filter((item: any) => item.Status === "Success");
    setData(Account);
    const provider = library ? library?.provider : "";
    const newWeb3 = getWeb3("", provider);
    const batch = new newWeb3.BatchRequest();
    Account.forEach((item: any) => {
      const address = ethers.utils.computeAddress("0x" + item.PubKey);
      batch.add(newWeb3.eth.getBalance.request(address));
    });
    batch.requestManager.sendBatch(batch.requests, (e: any, resArr: any) => {
      if (e) return;
      const detailsObj: any = {};
      resArr.forEach((item: any, i: number) => {
        detailsObj[Account[i].PubKey] = {
          balance: item.result,
        };
      });
      setDetails(detailsObj);
    });
  }, [GAccount, library]);

  const onSend = async (
    to: string,
    value: string,
    TokenAddress: string | null
  ) => {
    if (!execute) return;
    const res = await execute(active, to, value, TokenAddress);
    if (!res) {
      message.info("no sign");
    }
    if (res?.Status === "Success") {
      message.success("Success");
      setVisible(false);
      return true;
    }
    return false;
  };

  return (
    <div
      onMouseMove={() => {
        if (pollingPubKeyInfo) {
          globalDispatch({
            pollingPubKeyInfo: 0,
          });
          localStorage.setItem("pollingPubKeyInfo", "0");
        }
      }}
    >
      <Table
        columns={columns}
        dataSource={data
          .sort((a: any, b: any) => b.TimeStamp - a.TimeStamp)
          .map((item: any, i) => ({ ...item, k: i }))}
        rowKey="PubKey"
        key={Object.values(details).length}
        pagination={{
          total: data.length,
          hideOnSinglePage: true,
          pageSizeOptions: [10, 20, 50, 100],
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
      <Send
        visible={visible}
        onSend={onSend}
        setVisible={setVisible}
        balance={details[active["PubKey"]]?.balance}
        active={active}
      />
    </div>
  );
};

export default Index;
