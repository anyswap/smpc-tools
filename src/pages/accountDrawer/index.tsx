import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  Drawer,
  Menu,
  Table,
  Button,
  Tabs,
  Popover,
  Badge,
} from "antd";
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
import AccountApproval from "@/pages/approval/index";
import AccountApprovaled from "@/pages/approvaled/index";
import HistoryTransactions from "@/pages/approvaled/trading";
import CreateGrounp from "@/pages/createGrounp/index";
import SendTransaction from "./sendTransaction";
import QRCode from "qrcode.react";
import "./style.less";

const jszzicon = require("jazzicon");

const Index: React.FC = () => {
  const { account, library, chainId }: any = useActiveWeb3React();
  const [details, setDetails] = useState<any>({});
  const { drawerVisible, dispatch, activeAccount, selectedKeys } = useModel(
    "accountDrawer",
    ({ drawerVisible, dispatch, activeAccount, selectedKeys }: any) => ({
      drawerVisible,
      dispatch,
      activeAccount,
      selectedKeys,
    })
  );

  const {
    Account,
    transactionApprovalHaveHandled,
    accountApprovalHaveHandled,
  } = useModel(
    "global",
    ({
      Account,
      transactionApprovalHaveHandled,
      accountApprovalHaveHandled,
    }: any) => ({
      Account,
      transactionApprovalHaveHandled,

      accountApprovalHaveHandled,
    })
  );

  const { tradingList, approveList } = useModel(
    "approval",
    ({ tradingList, approveList }: any) => ({
      tradingList,
      approveList,
    })
  );

  // useEffect(() => {
  //   if (Account.filter((item: any) => item.Status === "Success").length == 1) {
  //     dispatch({ drawerVisible: false });
  //   }
  // }, [Account]);
  const List = Account.filter((item: any) => item.Status === "Success");
  const accountSelected = List.length ? activeAccount || List[0] : null;

  const getAccountBalance = () => {
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

      // formatUnits(details[item.PubKey]?.balance || 0, 10) +
      //   chainInfo[chainId]?.symbol;

      resArr.forEach((item: any, i: number) => {
        detailsObj[List[i].PubKey] = {
          balance: item.result,
        };
      });
      setDetails(detailsObj);
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      getAccountBalance();
    }, 5 * 1000);
    return () => {
      clearInterval(interval);
    };
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

        <div className="left" style={{ minWidth: 340 }}>
          {accountSelected && (
            <div
              className="openBtn"
              onClick={() =>
                dispatch({
                  drawerVisible: true,
                  selectedKeys: ["CreateGrounp"],
                })
              }
            >
              <RightOutlined />
            </div>
          )}
          {accountSelected ? (
            <>
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
                  <br />
                  <b>
                    {formatUnits(
                      details[accountSelected.PubKey]?.balance || 0,
                      details[accountSelected.PubKey]?.decimals || 18
                    ) +
                      " " +
                      chainInfo[chainId]?.symbol}
                  </b>
                </div>
                <div></div>
                <div className="accountDrawer-opr">
                  <span>
                    <Popover
                      title=""
                      content={
                        <div>
                          <QRCode
                            value={ethers.utils.computeAddress(
                              "0x" + accountSelected.PubKey
                            )}
                          />
                        </div>
                      }
                    >
                      <AppstoreAddOutlined />
                    </Popover>
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
                onClick={(e) => dispatch({ selectedKeys: [e.key] })}
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
                    label: (
                      <Badge
                        count={
                          tradingList.filter(
                            (item) =>
                              transactionApprovalHaveHandled.every(
                                (it) => it !== item.TimeStamp
                              ) && item.PubKey === accountSelected.PubKey
                          ).length
                        }
                        key={"Transactions"}
                        overflowCount={100}
                        offset={[12, -1]}
                        showZero={false}
                      >
                        Transactions
                      </Badge>
                    ),
                    children: [
                      {
                        key: "Approval",
                        label: (
                          <Badge
                            count={
                              tradingList.filter(
                                (item) =>
                                  transactionApprovalHaveHandled.every(
                                    (it) => it !== item.TimeStamp
                                  ) && item.PubKey === accountSelected.PubKey
                              ).length
                            }
                            key={"Approval"}
                            overflowCount={100}
                            offset={[12, -1]}
                            showZero={false}
                          >
                            Approval
                          </Badge>
                        ),
                      },
                      {
                        key: "History",
                        label: "History",
                      },
                    ],
                  },
                ]}
              />
            </>
          ) : (
            <div style={{ padding: 24, marginTop: 5 }}>
              <div
                className="account-List-Skip"
                onClick={() =>
                  dispatch({
                    selectedKeys: ["CreateGrounp"],
                    drawerVisible: false,
                  })
                }
              >
                <span>
                  <PlusCircleOutlined />
                  &nbsp; Create MPC
                </span>
              </div>
              <div
                className="account-List-Skip"
                onClick={() =>
                  dispatch({
                    selectedKeys: ["AccountApproval"],
                    drawerVisible: false,
                  })
                }
              >
                <Badge
                  count={
                    approveList.filter((item) =>
                      accountApprovalHaveHandled.every(
                        (it) => it !== item.TimeStamp
                      )
                    ).length
                  }
                  key={"AccountApproval"}
                  overflowCount={100}
                  offset={[12, -1]}
                  showZero={false}
                >
                  <span className="text">
                    <FormOutlined />
                    &nbsp; Account Approval
                  </span>
                </Badge>
              </div>
              <div
                className="account-List-Skip"
                onClick={() =>
                  dispatch({
                    selectedKeys: ["AccountApprovaled"],
                    drawerVisible: false,
                  })
                }
                style={{ marginBottom: 50 }}
              >
                <span>
                  <HistoryOutlined />
                  &nbsp; Account History
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="right" style={{ flex: 1, padding: "5px 20px" }}>
          {selectedKeys[0] === "Coins" && <CoinsList item={accountSelected} />}
          {selectedKeys[0] === "Approval" && <Approval />}
          {selectedKeys[0] === "History" && <HistoryTransactions />}
          {selectedKeys[0] === "AccountApproval" && <AccountApproval />}
          {selectedKeys[0] === "AccountApprovaled" && <AccountApprovaled />}
          {selectedKeys[0] === "CreateGrounp" && <CreateGrounp />}
        </div>
      </div>

      <Drawer
        visible={drawerVisible}
        placement="left"
        closable={false}
        zIndex={2}
        width={340}
        style={{ boxShadow: "none" }}
        bodyStyle={{ top: 30 }}
        mask={false}
        classNames={{ drawerShow: drawerVisible }}
        zIndex={drawerVisible ? 1000 : -1}
        style={{ left: drawerVisible ? 0 : -380 }}
        onClose={() => dispatch({ drawerVisible: false })}
      >
        {accountSelected && (
          <div
            className="openBtn"
            onClick={() =>
              dispatch({ drawerVisible: false, selectedKeys: ["Coins"] })
            }
          >
            <RightOutlined />
          </div>
        )}
        <div
          className="account-List-Skip"
          onClick={() =>
            dispatch({
              selectedKeys: ["CreateGrounp"],
              // drawerVisible: false,
            })
          }
        >
          <span>
            <PlusCircleOutlined />
            &nbsp; Create MPC
          </span>
        </div>
        <div
          className="account-List-Skip"
          onClick={() =>
            dispatch({
              selectedKeys: ["AccountApproval"],
              // drawerVisible: false,
            })
          }
        >
          <Badge
            count={
              approveList.filter((item) =>
                accountApprovalHaveHandled.every((it) => it !== item.TimeStamp)
              ).length
            }
            key={"AccountApproval"}
            overflowCount={100}
            offset={[12, -1]}
            showZero={false}
          >
            <span className="text">
              <FormOutlined />
              &nbsp; Account Approval
            </span>
          </Badge>
        </div>
        <div
          className="account-List-Skip"
          onClick={() =>
            dispatch({
              selectedKeys: ["AccountApprovaled"],
              // drawerVisible: false,
            })
          }
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
        <div
          style={{
            maxHeight: "calc(100vh - 250px)",
            overflowY: List.length > 10 ? "scroll" : "auto",
          }}
        >
          {List.map((item: any) => (
            <div
              className="accountDrawer-account"
              onClick={() =>
                dispatch({
                  activeAccount: item,
                  drawerVisible: false,
                  selectedKeys: ["Coins"],
                })
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
                  width: 245,
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
                    {formatUnits(
                      details[item.PubKey]?.balance || 0,
                      details[item.PubKey]?.decimals || 18
                    ) + chainInfo[chainId]?.symbol}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </Drawer>
      {/* </Drawer> */}
    </>
  );
};

export default Index;
