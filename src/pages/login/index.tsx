import { Form, Select, Button, message } from "antd";
import React, { useEffect, useState } from "react";
import { LeftOutlined } from "@ant-design/icons";
import { history, useModel, getLocale, setLocale, useIntl } from "umi";
import web3 from "@/assets/js/web3";
import { useActiveWeb3React } from "@/hooks";
import { useSignEnode, useSendTxDemo } from "@/hooks/useSigns";
import Logo_png from "@/pages/img/logo.svg";
import "./style.less";
import { nodeListItem } from "./d";

const Index = () => {
  const [inputNode, setInputNode] = useState("");
  const [value, setValue] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  // const { account, activate } = useActiveWeb3React();
  const { activate } = useActiveWeb3React();
  // const account = window.ethereum?.selectedAddress;
  const { account } = useActiveWeb3React();
  const { nodeList, isDay, globalDispatch, loginAccount } = useModel(
    "global",
    ({ isDay, nodeList, globalDispatch, address, loginAccount }) => ({
      isDay,
      nodeList,
      globalDispatch,
      address,
      loginAccount,
    })
  );
  const { execute } = useSignEnode(loginAccount.enode);
  const { execute: sendTx } = useSendTxDemo();

  useEffect(() => {
    localStorage.removeItem("node");
    message.config({
      top: 100,
      maxCount: 1,
      rtl: true,
    });
  }, []);

  // useEffect(() => {
  //   if (!account) {
  //     history.push("/");
  //   }
  // }, [account]);

  const getSignEnode = () => {
    if (!execute) return;
    execute().then(async (res) => {
      if (!res) {
        globalDispatch({
          loginAccount: {
            ...loginAccount,
            signEnode: "",
          },
        });
        return;
      }
      localStorage.setItem(
        "loginAccount",
        JSON.stringify({
          ...loginAccount,
          signEnode: loginAccount.enode + res,
        })
      );
      globalDispatch({
        loginAccount: {
          ...loginAccount,
          signEnode: loginAccount.enode + res,
        },
      });
      console.info("createGrounp", "createGrounp");
      history.push("/createGrounp");
    });
  };

  useEffect(() => {
    if (loginAccount.enode && !loginAccount.signEnode) getSignEnode();
  }, [loginAccount.enode]);

  const onFinish = async () => {
    if (!value) return;
    localStorage.setItem("loginAccount", "{}");
    globalDispatch({
      loginAccount: {
        ...loginAccount,
        enode: "",
        signEnode: "",
      },
    });
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
    } catch (err) {
      setLoading(false);
      console.info("errerr", err);
      message.error("检查节点");
    }
  };

  const goDemo = () => {
    history.push("/demo");
  };

  return (
    <div className={isDay ? "login" : "login dark"}>
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
          <span className="name1">
            {useIntl().formatHTMLMessage({ id: "g.SMPC" })}
          </span>
          <span className="name2">
            {useIntl().formatHTMLMessage({ id: "g.Wallet" })}
          </span>
        </div>
        <div className="back">
          <span onClick={() => history.push("/")}>
            <LeftOutlined />
            {useIntl().formatHTMLMessage({ id: "g.Back" })}
          </span>
        </div>
        <div className="tit">
          {useIntl().formatHTMLMessage({ id: "g.loginAccount" })}
        </div>
        <Form form={form} name="login" layout="vertical" onFinish={onFinish}>
          <Form.Item
            label={useIntl().formatHTMLMessage({ id: "g.setTheNode" })}
            required
            name="node"
            rules={[
              {
                required: true,
                message: useIntl().formatHTMLMessage({
                  id: "login.rules3",
                }) as string,
              },
            ]}
          >
            <Select
              placeholder="Select a person"
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
                  setValue(inputNode as string);
                }, 100);

                return;
              }}
              showSearch
              filterOption={() => true}
              options={[
                ...nodeList
                  .filter((item: nodeListItem) =>
                    (item.rpc || "").includes("http://")
                  )
                  .map((item: nodeListItem) => ({
                    label: item.rpc,
                    value: item.rpc,
                    key: item.rpc,
                  })),
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button
              htmlType="submit"
              type="primary"
              onClick={onFinish}
              loading={loading}
            >
              {useIntl().formatHTMLMessage({ id: "g.login" })}
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={goDemo} loading={loading}>
              Demo
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={sendTx} loading={loading}>
              SendT x
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Index;
