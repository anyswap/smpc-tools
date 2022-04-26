import React, { useEffect, useReducer, Dispatch } from "react";
import { Drawer, Form, Button, Select, Input, Checkbox } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import ModalHead from "@/component/modalHead";
import Logo_png from "@/pages/img/logo.svg";

const initState = {
  visible: false,
};

interface Iprops {
  isDay: boolean;
  dispatch: Dispatch<any>;
  visible: boolean;
}

const Index = (props: Iprops) => {
  const { isDay, dispatch, visible } = props;

  const [form] = Form.useForm();
  // const [state, dispatch] = useReducer(reducer, initState)
  // const { visible } = state;

  const onFinish = (v: any) => {
    console.info("v", v);
  };
  // useEffect(() => {
  //   if (visible) {
  //     dispatch(initState)
  //   }
  // }, [visible])

  return (
    <Drawer
      visible={visible}
      width={375}
      className={isDay ? "index_drawer" : "index_drawer dark"}
      closable={false}
      destroyOnClose
    >
      {/* <div className="title">
        <img src={Logo_png} width={35} />
        <span className="left">密钥</span><span className="right">管家</span>
      </div>
      <div className="back">
        <span onClick={() => dispatch({ visible: false })}>
          <LeftOutlined />
            Back
          </span>
      </div>
      <div className="action">
        创建钱包
      </div> */}
      <ModalHead dispatch={dispatch} name="创建钱包" />
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          label="选择钱包类型"
          name="a"
          required={false}
          rules={[{ required: true, message: "必填" }]}
        >
          <Select
            size="large"
            options={[
              {
                label: "aaaa",
                value: "aa",
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          label="帐户名称"
          name="b"
          required={false}
          rules={[{ required: true, message: "必填" }]}
        >
          <Input size="large" />
        </Form.Item>
        <Form.Item>
          <Button
            size="large"
            style={{ width: "100%" }}
            type="primary"
            htmlType="submit"
          >
            创建
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default Index;
