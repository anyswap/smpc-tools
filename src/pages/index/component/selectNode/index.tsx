import React, { useEffect, useReducer, Dispatch } from "react";
import { Drawer, Form, Button, Select, Input, Checkbox } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import ModalHead from "@/component/modalHead";
import { useModel } from "umi";
import Logo_png from "@/pages/img/logo.svg";
import web3 from "@/assets/js/web3.js";

interface nodeListItem {
  name: string;
  _id: string;
}

interface Iprops {
  dispatch: Dispatch<any>;
  visible: boolean;
}

const Index = (props: Iprops) => {
  const { dispatch, visible } = props;
  const { isDay, nodeList } = useModel("global", ({ isDay, nodeList }) => ({
    isDay,
    nodeList,
  }));
  console.info("nodeList11", nodeList);
  console.info("isDayisDayisDay", isDay);

  const [form] = Form.useForm();
  // const [state, dispatch] = useReducer(reducer, initState)
  // const { visible } = state;

  const onFinish = async (v: any) => {
    // const res = await web3.dcrm.createSDKGroup(v.node, nodeList._id)
    web3.dcrm
      .createSDKGroup(
        v.node,
        nodeList.map((item) => item._id)
      )
      .then((res) => console.info(1111, res))
      .catch((err) => console.info(2222, err));
    // console.info('resssss', res)
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
      <ModalHead dispatch={dispatch} name="节点选择" />
      {/* <div className="select-node">
        {
          nodeList.map(item => <div>{item.name}</div>)
        }
      </div> */}
      {/* <Button size="large" style={{ width: '100%' }} type="primary" htmlType="submit">创建</Button> */}
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          name="node"
          required={false}
          rules={[{ required: true, message: "至少选择一个" }]}
        >
          <Checkbox.Group
            className="select-node"
            options={nodeList.map((item: nodeListItem) => ({
              label: item.name,
              value: item._id,
            }))}
          />
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
