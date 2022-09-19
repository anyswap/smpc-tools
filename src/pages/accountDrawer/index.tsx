import React, { useEffect, useState } from "react";
import { Breadcrumb, Drawer, Menu, Table, Button, Tabs } from "antd";
import {
  CopyOutlined,
  PlusCircleOutlined,
  FormOutlined,
  AppstoreAddOutlined,
  RightOutlined,
  ShareAltOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import web3 from "@/assets/js/web3";
import { ethers } from "ethers";
import { useActiveWeb3React } from "@/hooks";
import { useModel, useIntl, history } from "umi";
import classNames from "classnames";
import { cutOut, getWeb3, formatUnits, getHead, copyTxt } from "@/utils";
import { chainInfo } from "@/config/chainConfig";
import CoinsList from "./coinsList";
import Approval from "@/pages/approval/trading";
import HistoryTransactions from "@/pages/approvaled/trading";
import SendTransaction from "./sendTransaction";
import "./style.less";

const jszzicon = require("jazzicon");

const Index: React.FC = () => {
  const { account, library, chainId }: any = useActiveWeb3React();
  const [details, setDetails] = useState<any>({});
  const [selectedKeys, setSelectedKeys] = useState<string[]>(["Coins"]);
  const { drawerVisible, dispatch, activeAccount } = useModel(
    "accountDrawer",
    ({ drawerVisible, dispatch, activeAccount }: any) => ({
      drawerVisible,
      dispatch,
      activeAccount,
    })
  );
  useEffect(() => {
    if (Account.filter((item: any) => item.Status === "Success").length === 0) {
      dispatch({ drawerVisible: true });
    }
  }, [Account]);
  const { Account } = useModel("global", ({ Account }: any) => ({
    Account,
  }));

  const List = Account.filter((item: any) => item.Status === "Success");
  const accountSelected = List.length ? activeAccount || List[0] : null;

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
  }, [Account, library]);
  return (
    <>
      {/* <span className="drawerBtn">
        <RightCircleOutlined
          onClick={() => dispatch({ drawerVisible: true })}
        />
      </span> */}
      {/* <Drawer
        width={"100%"}
        closable={true}
        visible={drawerVisible}
        placement="left"
        onClose={() => dispatch({ drawerVisible: false })}
        style={{ top: 70 }}
        zIndex={10}
      > */}
      {accountSelected && (
        <div
          style={{
            display: "flex",
            background: "#f6f7f8",
          }}
          className="drawerBox"
        >
          {/* <Drawer
          placement="left"
          open={drawerVisible}
          onClose={() => dispatch({ drawerVisible: false })}
        >
          dsdsdsdds
        </Drawer> */}

          <div className="left" style={{ width: 340 }}>
            <div
              className="openBtn"
              onClick={() => dispatch({ drawerVisible: true })}
            >
              <RightOutlined />
            </div>

            <div className="accountDrawer-head">
              <div className="img">
                <div className="thresHold">{accountSelected.ThresHold}</div>
                <img
                  src={getHead(accountSelected.TimeStamp)}
                  alt={ethers.utils.computeAddress(
                    "0x" + accountSelected.PubKey
                  )}
                />

                <div>
                  {ethers.utils
                    .computeAddress("0x" + accountSelected.PubKey)
                    .slice(0, 6)}
                </div>
              </div>
              <div>
                {cutOut(
                  ethers.utils.computeAddress("0x" + accountSelected.PubKey),
                  10,
                  6
                )}
              </div>
              <div className="accountDrawer-opr">
                <span>
                  <AppstoreAddOutlined />
                </span>
                <span>
                  <CopyOutlined
                    onClick={() =>
                      copyTxt(
                        ethers.utils.computeAddress(
                          "0x" + accountSelected.PubKey
                        )
                      )
                    }
                  />
                </span>
                <span>
                  <ShareAltOutlined
                    onClick={() => {
                      const chainDetial =
                        chainInfo[web3.utils.hexToNumber(chainId)];
                      window.open(
                        `${
                          chainDetial.explorer
                        }/address/${ethers.utils.computeAddress(
                          "0x" + accountSelected.PubKey
                        )}`
                      );
                    }}
                  />
                </span>
              </div>
              <div>
                <SendTransaction details={details} />
              </div>
            </div>
            <div style={{ maxHeight: "30vh", marginBottom: 35 }}></div>
            <Menu
              mode="inline"
              defaultOpenKeys={["Assets"]}
              selectedKeys={selectedKeys}
              onClick={(e) => setSelectedKeys([e.key])}
              items={[
                {
                  key: "Assets",
                  label: "Assets",
                  children: [
                    {
                      key: "Coins",
                      label: "Coins",
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
            {selectedKeys[0] === "Coins" && (
              <CoinsList item={accountSelected} />
            )}
            {selectedKeys[0] === "Approval" && <Approval />}
            {selectedKeys[0] === "History" && <HistoryTransactions />}
          </div>
        </div>
      )}
      <Drawer
        visible={drawerVisible}
        placement="left"
        closable={false}
        zIndex={2}
        classNames={{ drawerShow: drawerVisible }}
        zIndex={drawerVisible ? 1000 : -1}
        style={{ left: drawerVisible ? 0 : -380 }}
        onClose={() => dispatch({ drawerVisible: false })}
      >
        <div
          className="account-List-Skip"
          onClick={() => history.push("/createGrounp")}
        >
          <span>
            <PlusCircleOutlined />
            &nbsp; Create MPC
          </span>
        </div>
        <div
          className="account-List-Skip"
          onClick={() => history.push("/approval")}
        >
          <span>
            <FormOutlined />
            &nbsp; Account Approval
          </span>
        </div>
        <div
          className="account-List-Skip"
          onClick={() => history.push("/approvaled")}
          style={{ marginBottom: 50 }}
        >
          <span>
            <HistoryOutlined />
            &nbsp; Account History
          </span>
        </div>
        <div
          style={{
            fontSize: 18,
            lineHeight: "40px",
            fontWeight: "bold",
            color: "#2d2d2d",
            marginBottom: 10,
            borderBottom: "#ccc 2px solid",
          }}
        >
          Account List
        </div>
        {List.map((item: any) => (
          <div
            className="accountDrawer-account"
            onClick={() =>
              dispatch({ activeAccount: item, drawerVisible: false })
            }
            key={item.TimeStamp}
          >
            <div className="img">
              <div className="thresHold">{item.ThresHold}</div>
              <img
                className="mr5"
                src={getHead(item.TimeStamp)}
                alt={ethers.utils.computeAddress("0x" + item.PubKey)}
              />
            </div>
            <div
              style={{
                display: "inline-block",
                width: 280,
              }}
            >
              <span
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
                className={classNames({
                  active: item.KeyID === accountSelected.KeyID,
                })}
              >
                <span>
                  {cutOut(
                    ethers.utils.computeAddress("0x" + item.PubKey),
                    10,
                    8
                  )}
                </span>
                <span className="mll0">
                  {formatUnits(details[item.PubKey]?.balance || 0, 18) +
                    chainInfo[chainId]?.symbol}
                </span>
              </span>
            </div>
          </div>
        ))}
      </Drawer>
      {/* </Drawer> */}
    </>
  );
};

export default Index;
