import React, { useEffect, useState } from "react";
import Logo from "@/pages/img/logo.png";
import {
  history,
  useModel,
  getLocale,
  setLocale,
  useIntl,
  Redirect,
} from "umi";
import { useActiveWeb3React } from "@/hooks";
// import { setLocale, getLocale, history, getAllLocales, useIntl, useModel } from 'umi';
import {
  ConfigProvider,
  Select,
  Modal,
  Button,
  Badge,
  message,
  Drawer,
  Popover,
} from "antd";
import { ethers } from "ethers";
import enUS from "antd/lib/locale/en_US";
import zhCN from "antd/lib/locale/zh_CN";
import Sun from "@/assets/images/sun.png";
import Moon from "@/assets/images/moon.png";
import AccountDrawer from "@/pages/accountDrawer";
import "antd/dist/antd.min.css";
import "./custom-dark.css";
import "./custom-default.css";
import "./style.less";
import classNames from "classnames";
import { cutOut, getWeb3, formatUnits, getHead, copyTxt } from "@/utils";
import QRCode from "qrcode.react";
import { chainInfo } from "@/config/chainConfig";
import {
  CopyOutlined,
  PlusCircleOutlined,
  FormOutlined,
  AppstoreAddOutlined,
  RightOutlined,
  ShareAltOutlined,
  HistoryOutlined,
} from "@ant-design/icons";

const Index = (props: any) => {
  useEffect(() => {
    message.config({
      top: 100,
      maxCount: 1,
      rtl: true,
    });
  }, []);

  const [prefix, setPrefix] = useState(
    localStorage.getItem("prefix") || "custom-default"
  );
  const { library, activate, chainId } = useActiveWeb3React();
  const { account } = useActiveWeb3React();

  const localChange = (type: "en-Us" | "zh-CN") => {
    setLocale(type, false);
    // SetLocalAntd({ "en-Us": enUS, "zh-CN": zhCN }[type]);
  };

  const accountSelected = {
    From: "0x83ABC4B3000507f5488907c68234c0F457376776",
    GroupID:
      "e2e4277ce116b672f1cc8cb75d7cb687921aeba13b7560b9ca13da2e65106b544b5d684e577781525de037e190fbebd2b1bda7cc2c2bf607e197ce3897901c9f",
    KeyID: "0x551382d9d86380edd9ceb5f03366faebe92e7d7b53c60912c1eb63a7d5f340d3",
    PubKey:
      "0457d34e178f6e2accc4ffec5e4195d87e30acc3de4152762e2a3a27faa9c7eff22178537d207e9c11b9eee34f996eeb05117f3de61d25a1c73a2c6e5e892fa654",
    Status: "Success",
    ThresHold: "2/2",
    TimeStamp: "1661255125790",
    Tip: "",
  };
  return (
    <ConfigProvider prefixCls={prefix}>
      <div className={prefix === "custom-default" ? "layouts" : "layouts dark"}>
        <div className="head">
          <div className="left">
            <div className="logo">
              <img src={Logo} width={31} />
              <div className="name">
                <span className="name1">
                  {useIntl().formatHTMLMessage({ id: "g.SMPC" })}
                </span>
                <span className="name2">
                  {useIntl().formatHTMLMessage({ id: "g.Wallet" })}
                </span>
              </div>
            </div>
          </div>

          <div className="right">
            {
              <div
                className={classNames("loginInfo", {
                  visibility_hidden: !account,
                })}
              >
                {account && cutOut(account, 6, 4)}
              </div>
            }
            <Select
              className="mr8"
              defaultValue={getLocale()}
              onChange={localChange}
              options={[
                {
                  label: "中文简体",
                  value: "zh-CN",
                  key: "zh-CN",
                },
                {
                  label: "English",
                  value: "en-US",
                  key: "en-US",
                },
              ]}
            />
            <img
              src={prefix === "custom-default" ? Sun : Moon}
              width={50}
              height={28}
              onClick={() => {
                setPrefix(
                  prefix === "custom-default" ? "custom-dark" : "custom-default"
                );
                localStorage.setItem(
                  "prefix",
                  prefix === "custom-default" ? "custom-dark" : "custom-default"
                );
              }}
            />
          </div>
        </div>
        <div
          style={{
            padding: "0 15px",
            width: "100%",
          }}
        >
          <Drawer
            open
            mask={false}
            placement="left"
            closable={false}
            width={320}
          >
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
                  <b>{"xxx" + " " + chainInfo[chainId]?.symbol}</b>
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
                    <ShareAltOutlined />
                  </span>
                </div>
                <div>{/* <SendTransaction details={details} /> */}111</div>
              </div>
              <div style={{ maxHeight: "30vh", marginBottom: 35 }}></div>
              {/* <Menu
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
              /> */}
            </>
          </Drawer>
          {props.children}
        </div>
      </div>
    </ConfigProvider>
  );
};
export default Index;
