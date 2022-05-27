import { reducer } from "@/utils";
import { Input, Form, Select, Button, Modal, Collapse, message } from "antd";
import { useActiveWeb3React } from "@/hooks";
import React, { useReducer, useEffect } from "react";
import { useModel, history } from "umi";
import web3 from "@/assets/js/web3.ts";
import {
  useSignEnode,
  useCreateGroup,
  useReqSmpcAddress,
} from "@/hooks/useSigns";
import "./style.less";

const options = [2, 3, 4, 5, 6, 7];
const initState = {
  admin: [1, 2],
  visible: false,
  tEnode: "",
  Gid: "",
  Sgid: "",
  onCreateGroup: false,
};

const Index = () => {
  const [form] = Form.useForm();
  const { loginAccount } = useModel("global", ({ loginAccount }) => ({
    loginAccount,
  }));
  const { account } = useActiveWeb3React();

  const [state, dispatch] = useReducer(reducer, initState);
  const { admin, visible, tEnode, Gid, Sgid, onCreateGroup } = state;
  const { execute } = useCreateGroup(
    loginAccount?.rpc,
    `${admin.length}/${admin.length}`,
    Object.values(form.getFieldsValue())
  );
  const { execute: reqSmpcAddr } = useReqSmpcAddress(
    loginAccount?.rpc,
    Gid,
    `${admin.length}/${admin.length}`,
    Object.values(form.getFieldsValue()).join("|")
  );

  const thisEnode = async () => {
    form.setFieldsValue({ enode1: loginAccount.signEnode });
  };

  useEffect(() => {
    if (!loginAccount.signEnode) {
      history.push("/getEnode");
    }
    thisEnode();
  }, []);

  const reset = () => {
    form.resetFields();
    form.setFieldsValue({ enode1: loginAccount.enode });
  };

  const typeChange = (v: number) => {
    let arr = [];
    for (let i = 1; i < v + 1; i++) {
      arr.push(i);
    }
    dispatch({
      admin: arr,
    });
    reset();
  };

  const createAccount = async () => {
    if (!reqSmpcAddr) return;
    const res = await reqSmpcAddr();
    console.info("resresres", res);
    if (res.msg === "Success") {
      message.success("创建成功");
      history.push("./approval");
    }
  };

  useEffect(() => {
    if (Gid) createAccount();
  }, [Gid]);

  const createGroup = async () => {
    if (!execute) return;
    const res = await execute();
    if (res.msg === "Success") {
      dispatch({
        Gid: res.info.Gid,
      });
      // setTimeout(())
      // createAccount()
    }
  };
  console.info("Gid", Gid);
  console.info("Sgid", Sgid);
  return (
    <div className="create-grounp">
      <Form
        layout="vertical"
        form={form}
        onFinish={() => dispatch({ visible: true })}
      >
        <Form.Item>
          <Select
            onChange={typeChange}
            defaultValue={2}
            options={options.map((i) => ({
              label: `${i}/${i}模式`,
              value: i,
            }))}
          />
        </Form.Item>
        {admin.map((i: number, index: number) => (
          <Form.Item
            name={`enode${i}`}
            label={`管理人${i}`}
            required
            rules={[{ required: true, message: "必填" }]}
            key={i}
          >
            <Input placeholder="请输入" disabled={i === 1} />
          </Form.Item>
        ))}
        <Form.Item style={{ textAlign: "right" }}>
          <Button type="primary" htmlType="submit">
            创建共管帐户
          </Button>
          <Button onClick={reset}>重置</Button>
        </Form.Item>
      </Form>
      <Modal
        visible={visible}
        title="创建确认"
        onCancel={() => dispatch({ visible: false })}
        onOk={createGroup}
      >
        <h3>
          模式: {admin.length}/{admin.length}
        </h3>
        <Collapse expandIconPosition="right">
          <Collapse.Panel header="发起者" key={0}>
            {loginAccount.enode}
          </Collapse.Panel>
        </Collapse>
      </Modal>
    </div>
  );
};

export default Index;
