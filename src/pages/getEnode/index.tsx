import { Button, Input, message } from "antd";
import React, { useState } from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import web3 from "@/assets/js/web3";
import "./style.less";
import { useModel } from "umi";

import { useActiveWeb3React } from "@/hooks";

import { useSignEnode } from "@/hooks/useSigns";

const enodeStr =
  "enode://0f6d81912a28947af1a959367571a698f086dcc9f23ed2c620eeaa77b35307414a4bbd3c4b5653a2f0642f50020cafb4f9829386926130bed028a874c0c06dde@78.46.149.241:48516";

const Index = () => {
  const { account, library } = useActiveWeb3React();
  const { address } = useModel("global", ({ address }) => ({ address }));
  // const { loginAccount } = useModel("global", ({ loginAccount }) => ({ loginAccount.enode }));
  const [enode, setEnode] = useState("");
  console.log(account);
  // console.log(loginAccount);

  // const {execute} = useSignEnode(enode)
  const { execute } = useSignEnode(enodeStr);

  const onSearch = async (v: string) => {
    const is = await library?.send("eth_sign", [address]);
    console.info("isssss", is);
    setEnode("");
    if (!v.trim()) return;
    try {
      web3.setProvider(v);
      const res = await web3.smpc.getEnode();
      setEnode(res.Data.Enode);
    } catch (err) {
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
          disabled={Boolean(enode)}
          onClick={() => {
            if (execute)
              execute().then((res) => {
                setEnode(enodeStr + res + account);
              });
          }}
        >
          生成enode
        </Button>
        <Input.TextArea disabled value={enode} />
      </div>
    </div>
  );
};

export default Index;
