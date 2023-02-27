import React, { useCallback, useEffect } from "react";
import { Button, Select, message } from "antd";
import LogoW from "@/pages/img/logo-white.svg";
import LogoB from "@/pages/img/logo-black.svg";
import { history, useModel, getLocale, setLocale, useIntl } from "umi";
import { useActiveWeb3React } from "@/hooks";
import { injected } from "@/connectors";
import "./index.less";

const Index = () => {
  // const { account, activate } = useActiveWeb3React();
  const { activate } = useActiveWeb3React();
  // const account = window.ethereum?.selectedAddress;
  const { account } = useActiveWeb3React();

  const { isDay } = useModel("global", ({ isDay }) => ({ isDay }));

  useEffect(() => {
    message.config({
      top: 100,
      maxCount: 1,
      rtl: true,
    });
  }, []);

  useEffect(() => {
    debugger;
    if (account) {
      history.push("/login");
    } else {
      history.push("/");
    }
  }, [account]);
  console.info("account", account);
  const enable = useCallback(() => {
    console.info("activate", activate);
    console.info("account", account);
    if (!account && activate) {
      activate(injected);
    } else {
    }
  }, [account, activate]);

  return (
    <div
      className={isDay ? "index" : "index dark"}
      style={{ background: isDay ? "none" : "#152131" }}
    >
      <Select
        className="language"
        defaultValue={getLocale()}
        onChange={(v) => setLocale(v, false)}
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
      <div>
        <img src={isDay ? LogoB : LogoW} width={69} height={100} />
        <div className="name">
          <span className="left">
            {useIntl().formatHTMLMessage({ id: "g.SMPC" })}
          </span>
          <span className="right">
            {useIntl().formatHTMLMessage({ id: "g.Wallet" })}
          </span>
        </div>
        <div className="text">
          {useIntl().formatHTMLMessage({ id: "welcome" })}
          <br />
          {useIntl().formatHTMLMessage({ id: "welcomeOpt" })}
        </div>
        <Button type="primary" size="large" onClick={enable}>
          {useIntl().formatHTMLMessage({ id: "connectThePurse" })}
        </Button>
      </div>
    </div>
  );
};

export default Index;
