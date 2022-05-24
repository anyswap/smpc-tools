import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";

import web3 from "@/assets/js/web3";
import { Button, Card, Form, Input, List, Table, Tabs } from "antd";
import {
  useSignEnode,
  useCreateGroup,
  useReqSmpcAddress,
  useApproveReqSmpcAddress,
} from "@/hooks/useSigns";
import { useActiveWeb3React } from "@/hooks";

const { TextArea } = Input;
const { Column, ColumnGroup } = Table;
const { TabPane } = Tabs;

const USER_ONE = "userone";
const USER_TWO = "usertwo";

const ThresHold = "2/2";

const initConfig: any = {
  [USER_ONE]: {
    rpc: "http://81.69.176.223:5916",
  },
  [USER_TWO]: {
    rpc: "http://49.235.123.22:5927",
  },
};

function getStateReducer() {
  return {
    ...initConfig,
  };
}
function setStateReducer(state: any, action: any) {
  switch (action.type) {
    case "INCREAT_ENODE": {
      const { enode, user, signEnode, rpc } = action;
      // console.log(state)
      // console.log(action)
      // console.log(enode)
      // console.log(user)
      return {
        ...state,
        [user]: {
          ...(state[user] ? state[user] : {}),
          rpc: rpc ? rpc : state?.[user]?.rpc,
          enode: enode ? enode : state?.[user]?.enode,
          signEnode: signEnode ? signEnode : state?.[user]?.signEnode,
        },
      };
    }
    case "INCREAT_GID": {
      const { gid } = action;
      // console.log(state)
      // console.log(action)
      // console.log(enode)
      // console.log(user)
      return {
        ...state,
        gid,
      };
    }
  }
}

function SignEnoode({
  title,
  rpc,
  enode,
  signEnode,
  onGetRpc,
  onGetEnode,
  onGetSignEnode,
}: {
  title: any;
  rpc: any;
  enode: any;
  signEnode: any;
  onGetRpc: (v: any) => void;
  onGetEnode: (v: any) => void;
  onGetSignEnode: (v: any) => void;
}) {
  const { execute } = useSignEnode(enode);
  const getEnode = useCallback(async () => {
    if (rpc) {
      web3.setProvider(rpc);
      const res = await web3.smpc.getEnode();
      console.log(res.Data.Enode);
      onGetEnode(res.Data.Enode);
    }
  }, [rpc]);
  const validEnode = useCallback(() => {
    if (execute) {
      execute().then((res) => {
        onGetSignEnode(enode + res);
      });
    }
  }, [execute, enode]);
  return (
    <>
      <Card title={title} type="inner" style={{ width: "100%" }}>
        <Form
          name="basic"
          layout="vertical"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          autoComplete="off"
        >
          <Form.Item label="RPC">
            <Input
              value={rpc}
              onChange={(e: any) => {
                console.log(e);
                onGetRpc(e.target.value);
              }}
            />
            <Button
              onClick={() => {
                getEnode();
              }}
              disabled={Boolean(enode)}
            >
              Get Enode
            </Button>
          </Form.Item>
          <Form.Item label="Enode">
            <Input value={enode} disabled />
            <Button
              onClick={() => {
                validEnode();
              }}
              disabled={Boolean(!enode || signEnode)}
            >
              Valid Enode
            </Button>
          </Form.Item>
          <Form.Item label="Sign Enode">
            <TextArea rows={4} value={signEnode} disabled />
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}

function GetOtherSignEnode({
  enode,
  signEnode,
  onGetEnode,
  onGetSignEnode,
}: {
  enode: any;
  signEnode: any;
  onGetEnode: (v: any) => void;
  onGetSignEnode: (v: any) => void;
}) {
  return (
    <>
      <Card title={"Other Sign Enode"} type="inner" style={{ width: "100%" }}>
        <Form
          name="basic"
          layout="vertical"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          autoComplete="off"
        >
          <Form.Item label="Enode">
            <Input value={enode} disabled />
          </Form.Item>
          <Form.Item label="Sign Enode">
            <TextArea
              rows={4}
              value={signEnode}
              onChange={(e: any) => {
                const value = e.target.value;
                if (value && value.indexOf("0x") !== -1) {
                  const arr = value.split("0x");
                  onGetEnode(arr[0]);
                  onGetSignEnode(value);
                }
              }}
            />
            {/* <Button
              onClick={() => {
                validEnode();
              }}
              disabled={Boolean(!enode || signEnode)}
            >
              Valid Enode
            </Button> */}
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}

function CreateAccount({
  rpc,
  enodeOne,
  enodeTwo,
  sigsOne,
  sigsTwo,
  Gid,
  onGetGID,
}: {
  rpc: any;
  enodeOne: any;
  enodeTwo: any;
  sigsOne: any;
  sigsTwo: any;
  Gid: any;
  onGetGID: (v: any) => void;
}) {
  const enodeArr = useMemo(() => {
    const arr = [];
    if (enodeOne) {
      arr.push(enodeOne);
    }
    if (enodeTwo) {
      arr.push(enodeTwo);
    }
    return arr;
  }, [enodeOne, enodeTwo]);

  const { execute } = useCreateGroup(rpc, ThresHold, enodeArr);

  const Sigs = useMemo(() => {
    const arr = [];
    if (sigsOne) {
      arr.push(sigsOne);
    }
    if (sigsTwo) {
      arr.push(sigsTwo);
    }
    return arr;
  }, [sigsOne, sigsTwo]);
  const { execute: reqSmpcAddr } = useReqSmpcAddress(
    rpc,
    Gid,
    ThresHold,
    Sigs.join("|")
  );

  const createGroup = useCallback(() => {
    console.log(enodeArr);
    if (execute && enodeArr.length === 2) {
      execute().then((res) => {
        console.log(res);
        onGetGID(res.info.Gid);
      });
    }
  }, [execute, enodeArr]);

  const createAccount = useCallback(() => {
    console.log(Sigs);
    if (reqSmpcAddr) {
      reqSmpcAddr().then((res) => {
        console.log(res);
        // onGetGID(res.info.Gid)
      });
    }
  }, [reqSmpcAddr, Sigs]);
  return (
    <>
      <Button
        onClick={() => {
          createGroup();
        }}
        disabled={Boolean(Gid) || enodeArr.length < 2}
      >
        Create Group
      </Button>
      <Button
        onClick={() => {
          createAccount();
        }}
        disabled={!Boolean(Gid) || Sigs.length < 2}
      >
        Create Account
      </Button>
      <Form
        name="basic"
        layout="vertical"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        autoComplete="off"
      >
        <Form.Item label="Gid">
          <Input value={Gid} disabled />
        </Form.Item>
      </Form>
    </>
  );
}

function Approve({ rpc }: { rpc: any }) {
  const { account } = useActiveWeb3React();

  const [approveList, setApproveList] = useState<any>([]);

  const { execute } = useApproveReqSmpcAddress(rpc);
  const getReqAddrStatus = async (key: any) => {
    let data: any;
    const result = await web3.smpc.getReqAddrStatus(key);
    let cbData = result;
    console.log(result);
    if (result && typeof result === "string") {
      cbData = JSON.parse(cbData);
    }
    if (cbData.Status !== "Error") {
      let result =
        cbData.Data && cbData.Data.result ? JSON.parse(cbData.Data.result) : "";
      let status = result ? result.Status : "";
      let hash = result && result.PubKey ? result.PubKey : "";
      let list = result && result.AllReply ? result.AllReply : [];
      data = {
        msg: "Success",
        status: status,
        hash: hash,
        info: list,
        timestamp: result.TimeStamp,
      };
    } else {
      data = {
        msg: "Error",
        status: "Failure",
        hash: "",
        error: cbData.Error,
        info: [],
      };
    }
    // resolve(data)
    return data;
  };
  const getApproveList = useCallback(() => {
    if (rpc && account) {
      web3.setProvider(rpc);
      web3.smpc.getCurNodeReqAddrInfo(account).then(async (res: any) => {
        console.log(res);
        const arr = [];
        if (res.Data) {
          for (const item of res.Data) {
            const status = await getReqAddrStatus(item.Key);
            arr.push({
              ...item,
              ...status,
            });
          }
        }
        console.log(arr);
        setApproveList(arr);
      });
    }
  }, [account, rpc]);

  const approve = useCallback(
    (key, type) => {
      if (execute) {
        execute(key, type).then((res) => {
          console.log(res);
        });
      }
    },
    [execute]
  );

  useEffect(() => {
    getApproveList();
  }, [getApproveList, account, rpc]);
  return (
    <>
      <Button
        onClick={() => {
          getApproveList();
        }}
      >
        Get Approve List
      </Button>
      <Table dataSource={approveList} style={{ marginTop: "10px" }}>
        <Column title="Key" dataIndex="Key" key="Key" />
        <Column
          title="Action"
          key="action"
          render={(_: any, record: any) => (
            <>
              <Button
                onClick={() => {
                  console.log(record);
                  approve(record.Key, "AGREE");
                }}
              >
                Agree
              </Button>
              <Button
                onClick={() => {
                  console.log(record);
                  approve(record.Key, "DISAGREE");
                }}
              >
                Disagree
              </Button>
            </>
          )}
        />
      </Table>
    </>
  );
}

function AccountList({ rpc }: { rpc: any }) {
  const { account } = useActiveWeb3React();

  const [accountList, setAccountList] = useState<any>([]);

  const getAccountList = useCallback(() => {
    if (rpc && account) {
      web3.setProvider(rpc);
      web3.smpc.getAccounts(account, "0").then(async (res: any) => {
        console.log(res);
        let arr = [],
          arr1: any = [],
          arr2 = [];
        if (res.Status !== "Error") {
          arr =
            res.Data.result && res.Data.result.Group
              ? res.Data.result.Group
              : [];
        }
        for (let obj1 of arr) {
          for (let obj2 of obj1.Accounts) {
            if (!arr1.includes(obj2.PubKey)) {
              // console.log(obj2)
              let obj3 = {
                publicKey: obj2.PubKey,
                gID: obj1.GroupID,
                mode: obj2.ThresHold,
                name: obj2.PubKey.substr(2),
                timestamp: obj2.TimeStamp,
              };
              arr2.push(obj3);
              arr1.push(obj2.PubKey);
            }
          }
        }
        // return arr2
        setAccountList(arr2);
      });
    }
  }, [account, rpc]);

  useEffect(() => {
    getAccountList();
  }, [getAccountList, account, rpc]);
  return (
    <>
      <Button
        onClick={() => {
          getAccountList();
        }}
      >
        Get Account List
      </Button>
      <Table dataSource={accountList} style={{ marginTop: "10px" }}>
        <Column title="publicKey" dataIndex="publicKey" key="publicKey" />
        <Column
          title="Create Date"
          key="TimeStamp"
          render={(_: any, record: any) => <>{record.timestamp}</>}
        />
        <Column title="ThresHold" dataIndex="mode" key="mode" />
      </Table>
    </>
  );
}

export default function Demo() {
  const [smpcState, dispatchSmpcState] = useReducer(
    setStateReducer,
    {
      ...initConfig,
    },
    getStateReducer
  );
  console.log(smpcState);
  // const {} = smpcState
  return (
    <>
      <div className="container">
        <Tabs defaultActiveKey="Init" type="card">
          <TabPane tab="Init" key="Init">
            <Card title={"Init"} style={{ width: "100%", marginBottom: 16 }}>
              <SignEnoode
                title="User One"
                rpc={smpcState?.[USER_ONE]?.rpc}
                enode={smpcState?.[USER_ONE]?.enode}
                signEnode={smpcState?.[USER_ONE]?.signEnode}
                onGetRpc={(rpc) => {
                  dispatchSmpcState({
                    type: "INCREAT_ENODE",
                    user: USER_ONE,
                    rpc,
                  });
                }}
                onGetEnode={(enode) => {
                  dispatchSmpcState({
                    type: "INCREAT_ENODE",
                    user: USER_ONE,
                    enode,
                  });
                }}
                onGetSignEnode={(signEnode) => {
                  dispatchSmpcState({
                    type: "INCREAT_ENODE",
                    user: USER_ONE,
                    signEnode,
                  });
                }}
              />
              <GetOtherSignEnode
                enode={smpcState?.[USER_TWO]?.enode}
                signEnode={smpcState?.[USER_TWO]?.signEnode}
                onGetEnode={(enode) => {
                  dispatchSmpcState({
                    type: "INCREAT_ENODE",
                    user: USER_TWO,
                    enode,
                  });
                }}
                onGetSignEnode={(signEnode) => {
                  dispatchSmpcState({
                    type: "INCREAT_ENODE",
                    user: USER_TWO,
                    signEnode,
                  });
                }}
              />
            </Card>
          </TabPane>
          <TabPane tab="Create Account" key="CreateAccount">
            <Card
              title={"Create Account"}
              style={{ width: "100%", marginBottom: 16 }}
            >
              <CreateAccount
                rpc={smpcState?.[USER_ONE]?.rpc}
                enodeOne={smpcState?.[USER_ONE]?.enode}
                enodeTwo={smpcState?.[USER_TWO]?.enode}
                sigsOne={smpcState?.[USER_ONE]?.signEnode}
                sigsTwo={smpcState?.[USER_TWO]?.signEnode}
                Gid={smpcState?.gid}
                onGetGID={(gid) => {
                  dispatchSmpcState({
                    type: "INCREAT_GID",
                    gid: gid,
                  });
                }}
              />
            </Card>
          </TabPane>
          <TabPane tab="Approve" key="Approve">
            <Card title={"Approve"} style={{ width: "100%", marginBottom: 16 }}>
              <Approve rpc={smpcState?.[USER_ONE]?.rpc} />
            </Card>
          </TabPane>
          <TabPane tab="Account List" key="AccountList">
            <Card
              title={"Account List"}
              style={{ width: "100%", marginBottom: 16 }}
            >
              <AccountList rpc={smpcState?.[USER_ONE]?.rpc} />
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </>
  );
}
