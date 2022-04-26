import { Input, Form, Select, Button } from "antd";
import React, { useEffect } from "react";
import { LeftOutlined } from "@ant-design/icons";
import { history, useModel, getLocale, setLocale, useIntl } from "umi";
import web3 from "@/assets/js/web3.js";
import ModalHead from "@/component/modalHead";
import Logo_png from "@/pages/img/logo.svg";
import "./style.less";
import useInterval from "@/constants/hooks/useInterval";

interface nodeListItem {
  name: string;
  enode: string;
  rpc: string;
}

const Index = () => {
  const [form] = Form.useForm();
  const { nodeList, isDay } = useModel("global", ({ isDay, nodeList }) => ({
    isDay,
    nodeList,
  }));
  const onFinish = (v: { node: string }) => {
    console.info(v);
    console.info(1111, v.node);
    web3.setProvider(v.node);
    history.push("/getEnode");
  };

  return (
    <div className={isDay ? "login" : "login dark"}>
      {/* {useIntl().formatMessage({ id: 'number' })} */}
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
            name="node"
          >
            <Select
              placeholder="请输入"
              options={nodeList
                .filter((item: nodeListItem) => item.rpc.includes("http://"))
                .map((item: nodeListItem) => ({
                  label: item.rpc,
                  value: item.rpc,
                }))}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Index;
