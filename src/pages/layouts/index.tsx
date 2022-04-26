import React, { useState } from "react";
import Logo from "@/pages/img/logo.png";
import { history, useModel, getLocale, setLocale } from "umi";
// import { setLocale, getLocale, history, getAllLocales, useIntl, useModel } from 'umi';
import { ConfigProvider, Select } from "antd";
import enUS from "antd/lib/locale/en_US";
import zhCN from "antd/lib/locale/zh_CN";
import Sun from "@/assets/images/sun.png";
import Moon from "@/assets/images/moon.png";
import "./style.less";

const Index = (props) => {
  // console.info('his', history)location
  // console.info(111, getLocale)
  const { isDay, globalDispatch } = useModel(
    "global",
    ({ isDay, globalDispatch }) => ({ isDay, globalDispatch })
  );
  const [local, SetLocalAntd] = useState(enUS);
  const nav = [
    {
      name: "获取enode",
      url: "/getEnode",
    },
    {
      name: "审批",
      url: "/approvalList",
    },
    {
      name: "创建组",
      url: "/createGrounp",
    },
  ];

  const localChange = (type: "en-Us" | "zh-CN") => {
    setLocale(type, false);
    SetLocalAntd({ "en-Us": enUS, "zh-CN": zhCN }[type]);
  };

  return (
    <ConfigProvider locale={enUS}>
      <div className={isDay ? "layouts" : "layouts dark"}>
        <div className="head">
          <div className="left">
            <div className="logo">
              <img src={Logo} width={31} />
              <div className="name">
                <span className="name1">密钥</span>
                <span className="name2">管家</span>
              </div>
            </div>
            <div className="nav">
              {/* <div onClick={() => history.push('/approvalList')}>审批</div>
            <div>创建组</div> */}
              {nav.map((item) => {
                return (
                  <div
                    className={
                      history.location.pathname === item.url ? "active" : ""
                    }
                    onClick={() => history.push(item.url)}
                  >
                    {item.name}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="right">
            <Select
              defaultValue={getLocale()}
              onChange={localChange}
              options={[
                {
                  label: "中文简体",
                  value: "zh-CN",
                },
                {
                  label: "English",
                  value: "en-US",
                },
              ]}
            />
            <img
              src={isDay ? Sun : Moon}
              width={50}
              height={28}
              onClick={() => globalDispatch({ isDay: !isDay })}
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
