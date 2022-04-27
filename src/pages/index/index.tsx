import React, { useReducer } from "react";
import moment from "moment";
import { Button } from "antd";
import LogoW from "@/pages/img/logo-white.svg";
import LogoB from "@/pages/img/logo-black.svg";
import CreateWallet from "./component/selectNode";
import ConnectWallet from "./component/connectWallet";
import { mmWeb3 } from "@/libs/wallet/metamask.js";
import { reducer } from "@/utils";
import "./index.less";
import { useModel, history } from "umi";

// import { useActiveWeb3React } from '@/constants/hooks'

const initState = {
  visible: false,
};

const Index = () => {
  // const isDay = (moment().format('YYYY-MM-DD HH:mm:ss') < moment().format('YYYY-MM-DD 21:00:00')) &&
  //   (moment().format('YYYY-MM-DD HH:mm:ss') > moment().format('YYYY-MM-DD 05:00:00'));
  const { isDay, globalDispatch } = useModel(
    "global",
    ({ isDay, globalDispatch }) => ({ isDay, globalDispatch })
  );
  console.info("isDay", isDay);
  const [state, dispatch] = useReducer(reducer, initState);
  const { visible } = state;

  const enable = async () => {
    // const instance = await SUPPORTED_WALLETS.METAMASK.connector
    mmWeb3.enable().then((res: Array<string>) => {
      console.info("res", res);

      // const { library } = useActiveWeb3React();
      // library?.send('eth_sign', res).then(aaa => {
      //   console.info('aaaaa', aaa)
      // })

      globalDispatch({ address: res });
      history.push("/login");
    });
  };

  return (
    <div
      className={isDay ? "index" : "index dark"}
      style={{ background: isDay ? "none" : "#152131" }}
    >
      <div>
        <img src={isDay ? LogoB : LogoW} width={120} />
        <div className="name">
          <span className="left">密钥</span>
          <span className="right">管家</span>
        </div>
        <div className="text">
          欢迎使用 SMPC Wallet 1.0
          <br />
          请创建一个钱包或者导入一个钱包
        </div>
        {/* <div className="buttons">
          <CreateWallet isDay={isDay} dispatch={dispatch} visible={visible} />
          <span className="left" onClick={() => dispatch({ visible: true })}>创建</span>
          <span className="right">导入</span>
        </div> */}
        <Button type="primary" size="large" onClick={enable}>
          连接钱包
        </Button>
      </div>
    </div>
  );
};

export default Index;
