import { Input, Form, Select, Button, message } from "antd";
import React, { useEffect, useState } from "react";
import { LeftOutlined } from "@ant-design/icons";
import {
  history,
  useModel,
  getLocale,
  setLocale,
  useIntl,
  Redirect,
} from "umi";
import web3 from "@/assets/js/web3";
import { useActiveWeb3React } from "@/hooks";
// import ModalHead from "@/component/modalHead";
import Logo_png from "@/pages/img/logo.svg";
import "./style.less";

interface nodeListItem {
  name: string;
  enode: string;
  rpc: string;
}

const Index = () => {
  const [inputNode, setInputNode] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { account, library, activate } = useActiveWeb3React();
  const { nodeList, isDay, globalDispatch, address, loginAccount } = useModel(
    "global",
    ({ isDay, nodeList, globalDispatch, address, loginAccount }) => ({
      isDay,
      nodeList,
      globalDispatch,
      address,
      loginAccount,
    })
  );
  useEffect(() => {
    localStorage.removeItem("node");
  }, []);

  useEffect(() => {
    console.info("account", account);
    if (!account) {
      history.push("/");
    }
  }, [account]);

  const onFinish = async () => {
    if (!value) return;
    try {
      setLoading(true);
      web3.setProvider(value);
      const res = await web3.smpc.getEnode();
      setLoading(false);
      globalDispatch({
        loginAccount: {
          rpc: value,
          enode: res.Data.Enode,
        },
      });
      // localStorage.setItem("node", value);
      history.push("/getEnode");
    } catch (err) {
      console.info("errerr", err);
      message.error("检查节点");
    }
  };

  return (
    <div className={isDay ? "login" : "login dark"}>
      {/* {useIntl().formatMessage({ id: 'number' })} */}
      {/* {loginAccount.enode && <Redirect to="/getEnode" />} */}
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
      <div className="box">
        <div className="logo">
          <img src={Logo_png} width={35} />
          <span className="name1">SMPC</span>
          <span className="name2">Wallet</span>
        </div>
        <div className="back">
          <span onClick={() => history.push("/")}>
            <LeftOutlined />
            Back
          </span>
        </div>
        <div className="tit">登录账户</div>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="设置节点"
            required
            rules={[{ required: true, message: "至少选择一个" }]}
          >
            <Select
              placeholder="请输入"
              onChange={setValue}
              value={value}
              onSearch={setInputNode}
              onInputKeyDown={(e) => {
                if (e.keyCode !== 13) return;
                if (
                  nodeList.every(
                    (item: nodeListItem) => item.rpc !== inputNode.trim()
                  )
                ) {
                  globalDispatch({
                    nodeList: [...nodeList, { rpc: inputNode }],
                  });
                }
                setTimeout(() => {
                  form.setFieldsValue({
                    node: inputNode,
                  });
                  setValue(inputNode);
                }, 100);

                return;
              }}
              showSearch
              filterOption={() => true}
              options={[
                ...nodeList
                  .filter((item: nodeListItem) => item.rpc.includes("http://"))
                  .map((item: nodeListItem) => ({
                    label: item.rpc,
                    value: item.rpc,
                    key: item.rpc,
                  })),
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={onFinish} loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Index;
