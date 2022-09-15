import React, { useEffect, useState } from "react";
import { Breadcrumb, Drawer, Menu, Table } from "antd";
import {
  RightCircleOutlined,
  PlusCircleOutlined,
  FormOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { ethers } from "ethers";
import { useActiveWeb3React } from "@/hooks";
import { useModel, useIntl } from "umi";
import classNames from "classnames";
import { cutOut, getWeb3, formatUnits, getHead } from "@/utils";
import { chainInfo } from "@/config/chainConfig";
import CoinsList from "./coinsList";
import "./style.less";

const jszzicon = require("jazzicon");

const Index = () => {
  const { account, library, chainId }: any = useActiveWeb3React();
  const [details, setDetails] = useState<any>("{}");
  const { drawerVisible, dispatch, activeAccount } = useModel(
    "accountDrawer",
    ({ drawerVisible, dispatch, activeAccount }) => ({
      drawerVisible,
      dispatch,
      activeAccount,
    })
  );
  const { Account } = useModel("global", ({ Account }: any) => ({
    Account,
  }));

  const List = Account.filter((item: any) => item.Status === "Success");
  const accountSelected = activeAccount || List[0];

  useEffect(() => {
    const provider = library ? library?.provider : "";
    const newWeb3 = getWeb3("", provider);
    const batch = new newWeb3.BatchRequest();
    List.forEach((item: any) => {
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
  }, [List, library]);

  return (
    <>
      <RightCircleOutlined
        className="drawerBtn"
        twoToneColor="#eb2f96"
        color="gray"
        onClick={() => dispatch({ drawerVisible: true })}
      />
      <Drawer
        width={"98%"}
        visible={drawerVisible}
        placement="left"
        onClose={() => dispatch({ drawerVisible: false })}
      >
        <div style={{ display: "flex" }} className="drawerBox">
          <div className="left" style={{ width: 300 }}>
            <div className="skip mb10">
              <span>
                <PlusCircleOutlined />
                &nbsp; Create MPC
              </span>
            </div>
            <div className="skip mb10">
              <span>
                <FormOutlined />
                &nbsp; Approval Account
              </span>
            </div>
            <div className="accountDrawer-head">
              <div className="img">
                <div className="thresHold">{accountSelected.ThresHold}</div>
                <img
                  src={getHead(accountSelected.TimeStamp)}
                  alt={accountSelected.KeyID}
                />
              </div>
              <p>{accountSelected.KeyID}</p>
            </div>
            <div style={{ maxHeight: "30vh", marginBottom: 35 }}>
              {List.map((item: any) => (
                <div
                  className="accountDrawer-account"
                  onClick={() => dispatch({ activeAccount: item })}
                >
                  <div className="img">
                    <div className="thresHold">{item.ThresHold}</div>
                    <img
                      className="mr5"
                      src={getHead(item.TimeStamp)}
                      alt={item.KeyID}
                    />
                  </div>

                  <span
                    className={classNames({
                      active: item.KeyID === accountSelected.KeyID,
                    })}
                  >
                    {cutOut(item.KeyID, 10, 8)}
                    <span className="mll0">
                      {formatUnits(details["PubKey"]?.balance || 0, 18) +
                        chainInfo[chainId]?.symbol}
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <Menu
              mode="inline"
              items={[
                {
                  key: "Assets",
                  label: "Assets",
                  children: [
                    {
                      key: "Coins",
                      label: "Coins",
                    },
                    {
                      key: "Token",
                      label: "Token",
                    },
                  ],
                },
                {
                  key: "Transactions",
                  label: "Transactions",
                  children: [
                    {
                      key: "Approval",
                      label: "Approval",
                    },
                    {
                      key: "History",
                      label: "History",
                    },
                  ],
                },
              ]}
            />
          </div>
          <div className="right" style={{ flex: 1, padding: "5px 20px" }}>
            <CoinsList />
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default Index;
