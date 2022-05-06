import { Button, Input, message } from "antd";
import React, { useState } from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import web3 from "@/assets/js/web3";
import "./style.less";
import { useModel } from "umi";

import { useActiveWeb3React } from "@/hooks";

import { useSignEnode, useReqSmpcAddress } from "@/hooks/useSigns";

const enodeStr =
  "enode://0f6d81912a28947af1a959367571a698f086dcc9f23ed2c620eeaa77b35307414a4bbd3c4b5653a2f0642f50020cafb4f9829386926130bed028a874c0c06dde@78.46.149.241:48516";

const gID =
  "d5e3b925ecb0d7f3100060322020089da409e1d378a1c5c3c132ccf2ae46b09fddecacadf3bf1c8fe2bed76ffd9f76ee6a1f420017e53e826b872f13bf8b376d";

const ThresHold = "2/2";
const Sigs =
  "enode://f87387a5b08cbf13cdee8501ab07c7df9fbae1f959c2ecae4477f40e1ec7f425e9043ad6b18be2ea99048731362cd50cfa3559920326230d1620e0b07e0bd259@47.114.115.33:485140x8e2ac861271430518075fd9ae81ec8177be408b20c305c62ea3782e9a512afb2079a854ad4798ee0b284e99fa54fb50b27525e4cb6781201e1eb1c709b42fcfd00|enode://184d222fc98c19f0f1d98717288ee31e62fc8ad556d17614dec3bad4a6ed35f07659f94023f171b80d771ffb15511621ad3c9ddc5c521960d1d997eff7e59c1f@47.114.113.16:485140xd478faa586deae3ce62d9cd60b0b69097b02b26006b9d5b5a02236f73ff496ac129dfddc8407e18dc4a52630a5f359e6deaef513f399a501f60c091b46c59ea301";

const Index = () => {
  const { account, library } = useActiveWeb3React();
  const { address, loginAccount } = useModel(
    "global",
    ({ address, loginAccount }) => ({ address, loginAccount })
  );
  const [enode, setEnode] = useState("");
  // console.log(loginAccount);

  // const {execute} = useSignEnode(enode)
  // const { execute } = useSignEnode(enodeStr);
  // const { execute: reqSmpcAddr } = useReqSmpcAddress(gID, ThresHold, Sigs);
  // console.info("loginAccount", loginAccount.enode);
  const { execute } = useSignEnode(loginAccount.enode);

  const onSearch = async (v: string) => {
    console.info("execute", execute);
    setEnode("");
    try {
      if (execute) {
        execute().then((res) => {
          setEnode(loginAccount.enode);
          // setEnode(res.Data.Enode + res + account);
        });
      }
    } catch (err) {
      console.info("errerr", err);
      message.error("检查节点");
    }
  };

  return (
    <div className="container get-enode">
      <div>
        {/* <Input.Search
          onSearch={onSearch}
          type="search"
          enterButton={<ArrowRightOutlined />}
          placeholder="请选择节点"
        /> */}

        <Button
          // disabled={Boolean(enode)}
          // onClick={() => {
          //   if (execute)
          //     execute().then((res) => {
          //       setEnode(enodeStr + res + account);
          //     });
          // }}
          disabled={Boolean(enode)}
          onClick={onSearch}
          // onClick={() => {
          //   if (execute)
          //     execute().then((res) => {
          //       setEnode(enodeStr + res + account);
          //     });
          // }}
        >
          生成enode
        </Button>
        {/* <Button
          // disabled={Boolean(enode)}
          onClick={() => {
            if (reqSmpcAddr)
              reqSmpcAddr().then((res) => {
                // setEnode(enodeStr + res + account);
              });
          }}
        >
          Req SMPC Address
        </Button> */}
        <Input.TextArea disabled value={enode} />
      </div>
    </div>
  );
};

export default Index;
