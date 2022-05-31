import React, { useCallback, useEffect, useReducer } from "react";
import moment from "moment";
import { Button, Select } from "antd";
import LogoW from "@/pages/img/logo-white.svg";
import LogoB from "@/pages/img/logo-black.svg";
import CreateWallet from "./component/selectNode";
import ConnectWallet from "./component/connectWallet";
import { mmWeb3 } from "@/libs/wallet/metamask.js";
import { reducer } from "@/utils";
import "./index.less";
import { history, useModel, getLocale, setLocale, useIntl } from "umi";
import { useActiveWeb3React } from "@/hooks";
import { injected } from "@/connectors";
// import { useActiveWeb3React } from '@/constants/hooks'

const initState = {
  visible: false,
};

const Index = () => {
  const { account, library, activate } = useActiveWeb3React();
  console.log("account", account);
  // console.log(library)
  const { isDay, globalDispatch } = useModel(
    "global",
    ({ isDay, globalDispatch }) => ({ isDay, globalDispatch })
  );
  console.info("isDay", isDay);
  const [state, dispatch] = useReducer(reducer, initState);
  const { visible } = state;

  useEffect(() => {
    if (account) {
      history.push("/login");
    }
  }, [account]);

  // const enable = async () => {
  const enable = useCallback(() => {
    console.info(7777, !account, injected, activate);
    // if (!account && injected && activate) {
    if (!account && activate) {
      activate(injected);
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
          },
          {
            label: "English",
            value: "en-US",
          },
        ]}
      />
      <div>
        <img src={isDay ? LogoB : LogoW} width={69} height={100} />
        <div className="name">
          <span className="left">
            {useIntl().formatHTMLMessage({ id: "connectTheg.SMPCPurse" })}
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
        {/* <div className="buttons">
          <CreateWallet isDay={isDay} dispatch={dispatch} visible={visible} />
          <span className="left" onClick={() => dispatch({ visible: true })}>创建</span>
          <span className="right">导入</span>
        </div> */}
        <Button type="primary" size="large" onClick={enable}>
          {useIntl().formatHTMLMessage({ id: "connectThePurse" })}
        </Button>
      </div>
    </div>
  );
};

export default Index;
