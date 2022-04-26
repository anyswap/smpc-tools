import React, { useReducer, useState, useEffect } from "react";
import { Button, message, Modal } from "antd";
import { reducer } from "@/utils";
import { mmWeb3 } from "@/libs/wallet/metamask.js";
import SelectNodeModal from "@/pages/index/component/selectNode";

const initState = {
  visible: false,
  title: "选择钱包",
};

const Index = () => {
  const [state, dispatch] = useReducer(reducer, initState);
  const { visible, title } = state;

  const init = async () => {
    // const instance = await SUPPORTED_WALLETS.METAMASK.connector
    mmWeb3.enable().then((res: Array<string>) => {
      dispatch({ visible: true });
      console.info(111155, res);
    });
  };

  // useEffect(() => {
  //   const { ethereum } = window;
  //   ethereum.on('connect', (chainId: any) => {
  //     console.info(3333333, chainId)
  //   })
  // }, [])

  return (
    <>
      <Button type="primary" size="large" onClick={init}>
        连接钱包
      </Button>
      <SelectNodeModal visible={visible} dispatch={dispatch} />
    </>
  );
};
export default Index;
