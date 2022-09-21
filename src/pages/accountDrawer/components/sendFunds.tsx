import React, { useState, useEffect } from "react";
import { Button, Form, Modal, Input, message } from "antd";
import { useModel, useIntl } from "umi";
import { ethers } from "ethers";
import { useGetSign } from "@/hooks/useSigns";
import { cutOut, getWeb3, formatUnits, getHead, copyTxt } from "@/utils";
import { useActiveWeb3React } from "@/hooks";
import { chainInfo } from "@/config/chainConfig";
import Icon1 from "../img/icon1.svg";
import "./sendFunds.less";
type FormParams = {
  to: string;
  value: string;
  TokenAddress: string;
  setTypeOpen: () => void;
};
interface Iprops {
  details: any;
}
const Index = (props: Iprops) => {
  const { details } = props;
  console.info("details", details);
  const [form] = Form.useForm();
  const { rpc } = JSON.parse(localStorage.getItem("loginAccount") || "{}");
  const { execute } = useGetSign(rpc);
  const { account, library, chainId }: any = useActiveWeb3React();
  const { drawerVisible, dispatch, activeAccount } = useModel(
    "accountDrawer",
    ({ drawerVisible, dispatch, activeAccount }) => ({
      drawerVisible,
      dispatch,
      activeAccount,
    })
  );
  const { Account } = useModel("global", ({ Account }: any) => ({
    Account,
  }));
  const [open, setOpen] = useState(false);
  const List = Account.filter((item: any) => item.Status === "Success");
  const accountSelected = activeAccount || List[0];
  const address = ethers.utils.computeAddress("0x" + accountSelected.PubKey);

  const gRequired = useIntl().formatHTMLMessage({
    id: "g.required",
  });
  const gPlaceholder1 = useIntl().formatHTMLMessage({ id: "g.placeholder1" });
  const rules2 = useIntl().formatHTMLMessage({ id: "login.rules2" });
  const onFinish = (v: FormParams) => {
    onSend(v.to, v.value);
  };
  useEffect(() => {
    if (open) form.resetFields();
  }, [open]);

  const onSend = async (to: string, value: string) => {
    if (!execute) return;
    const res = await execute(
      {
        ...accountSelected,
        address: ethers.utils.computeAddress("0x" + accountSelected.PubKey),
      },
      to,
      value
    );
    if (!res) {
      message.info("no sign");
    }
    if (res?.Status === "Success") {
      message.success("Success");
      setOpen(false);
      props.setTypeOpen(false);
      return true;
    }
    return false;
  };

  return (
    <>
      <Button type="primary" size="large" onClick={() => setOpen(true)}>
        <img src={Icon1} />
        Send funds
      </Button>
      <Modal
        title={<span>&nbsp;</span>}
        open={open}
        onCancel={() => setOpen(false)}
        footer={false}
        destroyOnClose
      >
        <div className="sendFunds-box">
          <p style={{ fontSize: 16, color: "#566976" }}>Sending from</p>
          <div className="head">
            <div className="img">
              <img src={getHead(accountSelected.TimeStamp)} />
            </div>
            <div className="info">
              <div className="tit">{address.slice(0, 6)}</div>
              <div className="act">
                <span>{address}</span>
                <span>
                  {formatUnits(
                    details[accountSelected.PubKey]?.balance || 0,
                    18
                  ) + chainInfo[chainId]?.symbol}
                </span>
              </div>
            </div>
          </div>
          <Form name="sendFundsForm" onFinish={onFinish} form={form}>
            <div style={{ height: 210 }}>
              <p style={{ color: "rgba(0, 0, 0, 0.54)", marginTop: 20 }}>
                Recipient*
              </p>
              <Form.Item
                name="to"
                rules={[
                  {
                    required: true,
                    message: gRequired as string,
                  },
                ]}
              >
                <Input size="large" />
              </Form.Item>
              <p style={{ color: "rgba(0, 0, 0, 0.54)", marginTop: 20 }}>
                Amount
              </p>
              <Form.Item
                name="value"
                label=""
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
                      if (
                        !isNaN(v) &&
                        Number(v) > 0 &&
                        v <
                          formatUnits(
                            details[accountSelected.PubKey]?.balance || 0,
                            18
                          )
                      ) {
                        c();
                        return;
                      }
                      c(rules2 as string);
                    },
                  },
                ]}
              >
                <Input placeholder="Amount*" size="large" />
              </Form.Item>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                padding: "0 75px",
                borderTop: "1px solid #f0f0f0",
                paddingTop: 20,
              }}
            >
              <Button size="large" type="link" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="primary" size="large" htmlType="submit">
                &nbsp;Review&nbsp;
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default Index;
