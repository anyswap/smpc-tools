import { Button, Input, message } from "antd";
import React, { useState } from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import web3 from "@/assets/js/web3";
import "./style.less";
import { useModel } from "umi";

import { useActiveWeb3React } from "@/hooks";

import { useSignEnode } from "@/hooks/useSigns";

const Index = () => {
  const { account, library } = useActiveWeb3React();
  const { address, loginAccount } = useModel(
    "global",
    ({ address, loginAccount }) => ({ address, loginAccount })
  );
  const [enode, setEnode] = useState("");
  console.info("loginAccount", loginAccount.enode);
  const { execute } = useSignEnode(loginAccount.enode);

  const onSearch = async (v: string) => {
    console.info("execute", execute);
    setEnode("");
    try {
      if (execute) {
        execute().then((res) => {
          setEnode(loginAccount.enode);
          console.info(9999, res, account);
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
        <Input.TextArea disabled value={enode} />
      </div>
    </div>
  );
};

export default Index;
