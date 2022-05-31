import { reducer } from "@/utils";
import { Input, Form, Select, Button, Modal, Collapse, message } from "antd";
import { useActiveWeb3React } from "@/hooks";
import React, { useReducer, useEffect } from "react";
import { useModel, history, useIntl } from "umi";
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
  // const { loginAccount } = useModel("global", ({ loginAccount }) => ({
  //   loginAccount,
  // }));
  const loginAccount = JSON.parse(localStorage.getItem("loginAccount") || "{}");
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
  const createSuccess = useIntl().formatMessage({ id: "createSuccess" });
  const createAccount = async () => {
    if (!reqSmpcAddr) return;
    const res = await reqSmpcAddr();
    console.info("resresres", res);
    if (res.msg === "Success") {
      message.success(createSuccess);
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
              label: `${i}/${i}${useIntl().formatHTMLMessage({
                id: "createGrounp.model",
              })}`,
              value: i,
            }))}
          />
        </Form.Item>
        {admin.map((i: number, index: number) => (
          <Form.Item
            name={`enode${i}`}
            label={`${useIntl().formatHTMLMessage({
              id: "createGrounp.admin",
            })}${i}`}
            required
            rules={[
              {
                required: true,
                message: useIntl().formatHTMLMessage({ id: "g.required" }),
              },
            ]}
            key={i}
          >
            <Input
              placeholder={useIntl().formatHTMLMessage({
                id: "g.placeholder1",
              })}
              disabled={i === 1}
            />
          </Form.Item>
        ))}
        <Form.Item style={{ textAlign: "right" }}>
          <Button type="primary" htmlType="submit" className="mr10">
            {useIntl().formatHTMLMessage({ id: "nav.createAccount" })}
          </Button>
          <Button onClick={reset}>
            {useIntl().formatHTMLMessage({ id: "g.reset" })}
          </Button>
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
          {Object.values(form.getFieldsValue()).map((item: string, i) => (
            <Collapse.Panel header={`发起者${i + 1}`} key={i}>
              {item}
            </Collapse.Panel>
          ))}
        </Collapse>
      </Modal>
    </div>
  );
};

export default Index;
