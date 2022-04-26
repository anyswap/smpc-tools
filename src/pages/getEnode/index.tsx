import { Button, Input, message } from "antd";
import React, { useState } from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import web3 from "@/assets/js/web3.js";
import "./style.less";

const Index = () => {
  const [enode, setEnode] = useState("");

  const onSearch = async (v: string) => {
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
          placeholder="输入节点"
        />
        <Input.TextArea disabled value={enode} />
      </div>
    </div>
  );
};

export default Index;
