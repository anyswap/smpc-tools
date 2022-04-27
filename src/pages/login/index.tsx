import { Input, Form, Select, Button, message } from "antd";
import React, { useEffect } from "react";
import { LeftOutlined } from "@ant-design/icons";
import { history, useModel, getLocale, setLocale, useIntl } from "umi";
import web3 from "@/assets/js/web3.ts";
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
  const { nodeList, isDay, globalDispatch, address } = useModel(
    "global",
    ({ isDay, nodeList, globalDispatch, address }) => ({
      isDay,
      nodeList,
      globalDispatch,
      address,
    })
  );
  const onFinish = async (v: { node: string }) => {
    // const hash = web3.utils.sha3('xxx');
    // const accounts = await web3.eth.getAccounts()
    // const signature = await web3.eth.personal.sign(hash, address[0])
    // console.info('accounts', accounts)
    // console.info('signature', signature)
    try {
      web3.setProvider(v.node);
      const res = await web3.smpc.getEnode();
      console.info("res", res);
      globalDispatch({
        loginAccount: {
          rpc: v.node,
          enode: res.Data.Enode,
        },
      });
      history.push("/getEnode");
    } catch (err) {
      console.info("errerr", err);
      message.error("检查节点");
    }
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
              options={[
                ...nodeList
                  .filter((item: nodeListItem) => item.rpc.includes("http://"))
                  .map((item: nodeListItem) => ({
                    label: item.rpc,
                    value: item.rpc,
                  })),
                {
                  label: "http://81.69.176.223:5916",
                  value: "http://81.69.176.223:5916",
                },
              ]}
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
