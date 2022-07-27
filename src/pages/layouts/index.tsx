import React, { useEffect, useState } from "react";
import Logo from "@/pages/img/logo.png";
import { history, useModel, getLocale, setLocale, useIntl } from "umi";
import { useActiveWeb3React } from "@/hooks";
// import { setLocale, getLocale, history, getAllLocales, useIntl, useModel } from 'umi';
import { ConfigProvider, Select, Modal, Button, Badge, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { cutOut, copyTxt } from "@/utils";
import enUS from "antd/lib/locale/en_US";
import zhCN from "antd/lib/locale/zh_CN";
import Sun from "@/assets/images/sun.png";
import Moon from "@/assets/images/moon.png";
import "antd/dist/antd.min.css";
import "./custom-dark.css";
import "./custom-default.css";
import "./style.less";

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
  // const { account, library, activate } = useActiveWeb3React();
  const { library, activate } = useActiveWeb3React();
  const account = window.ethereum?.selectedAddress;
  const { rpc = "", signEnode = "" } = JSON.parse(
    localStorage.getItem("loginAccount") || "{}"
  );
  const { globalDispatch, pollingRsvInfo, pollingPubKeyInfo, pollingPubKey } =
    useModel(
      "global",
      ({
        globalDispatch,
        pollingRsvInfo,
        pollingPubKeyInfo,
        pollingPubKey,
      }) => ({
        globalDispatch,
        pollingRsvInfo,
        pollingPubKeyInfo,
        pollingPubKey,
      })
    );
  const _local: any = {
    "zh-CN": zhCN,
    "en-US": enUS,
  };
  const [local, SetLocalAntd] = useState(
    _local[localStorage.getItem("umi_locale") || "en-US"]
  );
  const [visible, setVisible] = useState(false);
  const nav = [
    // {
    //   name: useIntl().formatHTMLMessage({ id: "nav.accountList" }),
    //   url: "/account",
    // },
    {
      name: useIntl().formatHTMLMessage({ id: "nav.createAccount" }),
      url: "/createGrounp",
    },
    // {
    //   name: "获取enode",
    //   url: "/getEnode",
    // },
    // {
    //   name: useIntl().formatHTMLMessage({ id: "nav.approval" }),
    //   url: "/approval",
    // },
  ];

  const localChange = (type: "en-Us" | "zh-CN") => {
    setLocale(type, false);
    SetLocalAntd({ "en-Us": enUS, "zh-CN": zhCN }[type]);
  };
  // useEffect(() => {
  //   if (!loginAccount.enode) history.push("/");
  // }, []);

  useEffect(() => {
    if (!account) {
      history.push("/");
      return;
    }
    if (!rpc || !signEnode) {
      history.push("/login");
    }
  }, [account, rpc]);

  const cutOutSign = cutOut("0x" + signEnode.split("0x")[1], 6, 4);

  const logout = () => {
    localStorage.removeItem("loginAccount");
    setVisible(false);
  };
  const { ethereum }: any = window;
  const { approveList, tradingList } = useModel(
    "approval",
    ({ approveList, tradingList }) => ({
      approveList,
      tradingList,
    })
  );

  return (
    <ConfigProvider locale={local} prefixCls={prefix}>
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
          <div className="nav">
            {/* <div onClick={() => history.push('/approvalList')}>审批</div>
            <div>创建组</div> */}
            <Badge
              count={pollingPubKeyInfo}
              key={pollingPubKeyInfo}
              overflowCount={100}
              offset={[0, 10]}
              showZero={false}
            >
              <div
                key="/account"
                className={
                  history.location.pathname === "/account"
                    ? "item active"
                    : "item"
                }
                onClick={() => history.push("/account")}
              >
                {useIntl().formatHTMLMessage({ id: "nav.accountList" })}
              </div>
            </Badge>
            {nav.map((item) => {
              return (
                <div
                  key={item.url}
                  className={
                    history.location.pathname === item.url
                      ? "item active"
                      : "item"
                  }
                  onClick={() => history.push(item.url)}
                >
                  {item.name}
                </div>
              );
            })}
            {/* {
      name: useIntl().formatHTMLMessage({ id: "nav.approvaled" }),
      url: "/approvaled",
    }, */}
            <Badge
              count={approveList.length + tradingList.length}
              overflowCount={100}
              offset={[0, 10]}
              showZero={false}
            >
              <div
                key="/approval"
                className={
                  history.location.pathname === "/approval"
                    ? "item active"
                    : "item"
                }
                onClick={() => history.push("/approval")}
              >
                {useIntl().formatHTMLMessage({ id: "nav.approval" })}
              </div>
            </Badge>
            <Badge
              count={pollingRsvInfo}
              overflowCount={100}
              offset={[0, 10]}
              showZero={false}
            >
              <div
                key="/approvaled"
                className={
                  history.location.pathname === "/approvaled"
                    ? "item active"
                    : "item"
                }
                onClick={() => history.push("/approvaled")}
              >
                {useIntl().formatHTMLMessage({ id: "approval.history" })}
              </div>
            </Badge>
          </div>
          <div className="right">
            <Modal
              title={useIntl().formatHTMLMessage({ id: "account" })}
              footer={false}
              visible={visible}
              onCancel={() => setVisible(false)}
              getContainer={
                document.getElementsByClassName("layouts")[0] as HTMLElement
              }
            >
              <div className="flex_SB">
                <span>{rpc}</span>
                <Button type="link" onClick={logout}>
                  退出
                </Button>
              </div>
              <div>
                {/* {signEnode} */}
                <span className="mr10">{cutOut(signEnode, 30, 8)}</span>
                <CopyOutlined
                  onClick={() => copyTxt(signEnode)}
                  style={{ fontSize: 17, cursor: "pointer" }}
                />
              </div>
            </Modal>
            <div className="loginInfo" onClick={() => setVisible(true)}>
              {cutOut(ethereum?.selectedAddress, 6, 4)}
            </div>
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
                // globalDispatch({ isDay: !isDay })
              }}
            />
          </div>
        </div>
        <div
          style={{
            padding: "0 15p",
            width: "100%",
            maxWidth: 1440,
            margin: "30px auto",
          }}
        >
          {props.children}
        </div>
      </div>
    </ConfigProvider>
  );
};
export default Index;
