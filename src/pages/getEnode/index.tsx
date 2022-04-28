import { Button, Input, message } from "antd";
import React, { useState } from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import web3 from "@/assets/js/web3";
import "./style.less";
import { useModel } from "umi";

import { useActiveWeb3React } from "@/hooks";

const Index = () => {
  const { account, library } = useActiveWeb3React();
  const { address } = useModel("global", ({ address }) => ({ address }));
  const [enode, setEnode] = useState("");
  console.log(account);
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
        <Input.Search
          onSearch={onSearch}
          type="search"
          enterButton={<ArrowRightOutlined />}
          placeholder="请选择节点"
        />
        <Input.TextArea disabled value={enode} />
      </div>
    </div>
  );
};

export default Index;
