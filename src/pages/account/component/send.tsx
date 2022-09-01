import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Tabs, message } from "antd";
import { useIntl } from "umi";
import { abi } from "@/assets/js/web3";
import { useActiveWeb3React } from "@/hooks";
import { chainInfo } from "@/config/chainConfig";
const Web3 = require("web3");

type Iprops = {
  visible: boolean;
  onSend: any;
  setVisible: (visible: boolean) => void;
  balance: number;
  active: any;
};

type FormParams = {
  to: string;
  value: string;
  TokenAddress: string;
};

const Index: React.FC<Iprops> = (props) => {
  const { visible, onSend, setVisible, balance, active } = props;
  const { chainId }: any = useActiveWeb3React();
  const { address } = active;

  const [form] = Form.useForm();
  const [activeKey, setActiveKey] = useState("Coin");

  const tokenFinish = (v: FormParams) => {
    let web3;
    let currentProvider = new Web3.providers.HttpProvider(
      chainInfo[chainId].nodeRpc
    );
    try {
      web3 = new Web3(currentProvider);
    } catch (error) {
      web3 = new Web3();
    }
    const contract = new web3.eth.Contract(abi);
    contract.options.address = v.TokenAddress;
    contract.methods.balanceOf(address).call(async (e: any, r: any) => {
      if (e) return;
      const balance = Math.pow(10, 18) / Number(r);
      // if (!Number(r)) {
      //   message.error(`balance: ${r}`);
      //   return;
      // }
      debugger;
      if (Number(v.value) > balance) {
        message.error(`Not sufficient funds, Balance: ${balance}`);
        return;
      }
      const res = await onSend(v.to, v.value, v.TokenAddress);
      if (res) setVisible(false);
    });
  };

  const onFinish = async (v: FormParams) => {
    if (activeKey === "Token") {
      tokenFinish(v);
      return;
    }
    const res = await onSend(v.to, v.value);
    if (res) setVisible(false);
  };
  const rules2 = useIntl().formatHTMLMessage({ id: "login.rules2" });
  const gRequired = useIntl().formatHTMLMessage({
    id: "g.required",
  });
  const gPlaceholder1 = useIntl().formatHTMLMessage({ id: "g.placeholder1" });

  useEffect(() => {
    if (!visible) form.resetFields();
    setActiveKey("Coin");
  }, [visible]);
  return (
    <Modal
      title={useIntl().formatHTMLMessage({ id: "transaction" })}
      visible={visible}
      onOk={form.submit}
      onCancel={() => setVisible(false)}
      width={620}
      forceRender
      maskClosable={false}
    >
      <Tabs centered activeKey={activeKey} onChange={setActiveKey} type="card">
        <Tabs.TabPane tab="Coin" key="Coin" />
        <Tabs.TabPane tab="Token" key="Token" />
      </Tabs>
      <Form
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 15 }}
        onFinish={onFinish}
        name="send"
      >
        {activeKey === "Token" && (
          <Form.Item
            label="Token Address"
            name="TokenAddress"
            rules={[{ required: true }]}
          >
            <Input placeholder={gPlaceholder1 as string} />
          </Form.Item>
        )}
        <Form.Item
          name="to"
          label="To"
          rules={[
            {
              required: true,
              message: gRequired as string,
            },
          ]}
        >
          <Input placeholder={gPlaceholder1 as string} />
        </Form.Item>

        <Form.Item
          name="value"
          label="Value"
          rules={[
            // {
            //   required: true,
            //   message: useIntl().formatHTMLMessage({
            //     id: "g.required",
            //   }) as string,
            // },
            {
              required: true,
              validator: (r, v, c) => {
                if (!v || !v.trim()) {
                  c(gRequired as string);
                  return;
                }

                //如果是Token交易
                if (activeKey === "Token") {
                  c();
                  return;
                }

                if (
                  !isNaN(v) &&
                  Number(v) > 0 &&
                  balance / Math.pow(10, 18) >= Number(v)
                ) {
                  // if (!isNaN(v) && Number(v) > 0) {
                  console.info("balance", balance);
                  console.info("v", v);
                  c();
                  return;
                }

                c(rules2 as string);
              },
            },
          ]}
        >
          <Input placeholder={gPlaceholder1 as string} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Index;
