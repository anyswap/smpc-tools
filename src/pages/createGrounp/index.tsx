import { reducer } from "@/utils";
import { Input, Form, Select, Button, Modal, Collapse, message } from "antd";
import { useActiveWeb3React } from "@/hooks";
import React, { useReducer, useEffect } from "react";
import { useModel, history, useIntl } from "umi";
import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
import web3 from "@/assets/js/web3";
import { useCreateGroup, useReqSmpcAddress } from "@/hooks/useSigns";
import "./style.less";

const initState = {
  admin: [1, 2],
  visible: false,
  tEnode: "",
  Gid: "",
  Sgid: "",
  onCreateGroup: false,
  ThresHold: "",
  Enode: [],
};

const Index = () => {
  const [form] = Form.useForm();
  const { globalDispatch, pollingRsv } = useModel(
    "global",
    ({ globalDispatch, pollingRsv }: any) => ({
      globalDispatch,
      pollingRsv,
    })
  );
  const loginAccount = JSON.parse(localStorage.getItem("loginAccount") || "{}");

  const [state, dispatch] = useReducer(reducer, initState);
  const { admin, visible, Gid } = state;
  const { execute } = useCreateGroup(
    loginAccount?.rpc,
    form.getFieldValue("ThresHold"),
    Object.values(form.getFieldsValue()).filter((item: any) =>
      item?.includes("enode")
    ) as any
  );
  const { execute: reqSmpcAddr } = useReqSmpcAddress(
    loginAccount?.rpc,
    Gid,
    form.getFieldValue("ThresHold"),
    Object.values(form.getFieldsValue())
      .filter((item: any) => item?.includes("enode"))
      .join("|"),
    form.getFieldValue("keytype")
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

  useEffect(() => {
    onstorage;
  });

  const createSuccess = useIntl().formatMessage({ id: "createSuccess" });
  const createAccount = async () => {
    if (!reqSmpcAddr) return;
    const res = await reqSmpcAddr();
    if (res.msg === "Success") {
      message.success(createSuccess);
      dispatch({ visible: false });
      const newPollingPubKeyItem = {
        fn: "getReqAddrStatus",
        params: [res.info],
        data: {
          GroupID: Gid,
          ThresHold: form.getFieldValue("ThresHold"),
        },
      };
      globalDispatch({
        pollingPubKey: [
          newPollingPubKeyItem,
          ...JSON.parse(localStorage.getItem("pollingPubKey") || "[]"),
        ],
      });
      localStorage.setItem(
        "pollingPubKey",
        JSON.stringify([
          newPollingPubKeyItem,
          ...JSON.parse(localStorage.getItem("pollingPubKey") || "[]"),
        ])
      );
    } else {
      message.error(res.msg);
    }
  };

  useEffect(() => {
    if (Gid) createAccount();
  }, [Gid]);

  const createGroup = async () => {
    dispatch({
      Gid: "",
    });
    web3.setProvider(loginAccount?.rpc);
    if (!execute) return;
    const res = await execute();
    if (res.msg === "Success") {
      dispatch({
        Gid: res.info.Gid,
      });
    } else {
      message.error(res.error);
    }
  };

  useEffect(() => {
    form.setFieldsValue({ ThresHold: `${admin.length}/${admin.length}` });
  }, [admin]);

  const add = () => {
    dispatch({
      admin: [...admin, admin[admin.length - 1] + 1],
    });
  };

  const del = (index: number) => {
    const newtAdmin = [...admin];
    newtAdmin.splice(index, 1);
    dispatch({
      admin: newtAdmin,
    });
  };

  const message1 = useIntl().formatMessage({ id: "thereAreDuplicateValues" });

  const onFinish = () => {
    const values = Object.values(form.getFieldsValue());
    if (
      //检查表单重复值
      !values.every((item) => values.filter((it) => it === item).length === 1)
    ) {
      message.error(message1);
      return;
    }
    dispatch({ visible: true });
  };

  const initiator = useIntl().formatHTMLMessage({
    id: "initiator",
  });

  return (
    <div className="create-grounp">
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <div>
          <Form.Item name="keytype" label="MpcType" initialValue="EC256K1">
            <Select
              options={[
                {
                  value: "EC256K1",
                },
                {
                  value: "ED25519",
                },
              ]}
            />
          </Form.Item>
        </div>
        {admin.map((i: number, index: number) => (
          <div key={i}>
            <Form.Item
              name={`enode${i}`}
              label={`${useIntl().formatHTMLMessage({
                id: "createGrounp.admin",
              })}${index + 1}`}
              required
              rules={[
                {
                  required: true,
                  message: useIntl().formatHTMLMessage({
                    id: "g.required",
                  }) as string,
                },
              ]}
              key={i}
            >
              <Input
                placeholder={
                  useIntl().formatHTMLMessage({
                    id: "g.placeholder1",
                  }) as string
                }
                disabled={i === 1}
              />
            </Form.Item>
            <span className="opts">
              {index !== 0 &&
                admin.length < 7 &&
                index === admin.length - 1 && (
                  <PlusCircleOutlined onClick={add} />
                )}
              {index !== 0 && admin.length > 2 && (
                <MinusCircleOutlined onClick={() => del(index)} />
              )}
            </span>
          </div>
        ))}

        <div className="flex_SB" style={{ width: "80%" }}>
          <span>
            <Form.Item name="ThresHold" initialValue={"2/2"}>
              <Select
                style={{ width: 100 }}
                options={admin.map((item: any, i: number) => ({
                  value: `${i + 1}/${admin.length}`,
                  label: `${i + 1}/${admin.length}`,
                  disabled: i === 0,
                }))}
              />
            </Form.Item>
          </span>
          <span>
            <Button type="primary" htmlType="submit" className="mr10">
              {useIntl().formatHTMLMessage({ id: "nav.createAccount" })}
            </Button>
            <Button onClick={reset}>
              {useIntl().formatHTMLMessage({ id: "g.reset" })}
            </Button>
          </span>
        </div>
      </Form>
      <Modal
        visible={visible}
        forceRender
        title={useIntl().formatHTMLMessage({ id: "Create_confirmation" })}
        onCancel={() => dispatch({ visible: false })}
        onOk={createGroup}
        getContainer={
          document.getElementsByClassName("layouts")[0] as HTMLElement
        }
      >
        <h3>
          {useIntl().formatHTMLMessage({
            id: "accountList.thresHold",
          })}
          : {form.getFieldValue("ThresHold")}
        </h3>
        <Collapse expandIconPosition="end">
          {Object.values(form.getFieldsValue())
            .filter((item: any) => item?.includes("enode"))
            .map((item: any, i) => (
              <Collapse.Panel header={`${initiator}${i + 1}`} key={i}>
                {item}
              </Collapse.Panel>
            ))}
        </Collapse>
      </Modal>
    </div>
  );
};

export default Index;
