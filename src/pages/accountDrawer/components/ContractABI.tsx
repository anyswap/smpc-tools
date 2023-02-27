import { Button, Modal, Form, Input, Select } from "antd";
import React, { useReducer, useMemo } from "react";
import { useModel, useIntl } from "umi";
import Icon2 from "../img/icon2.svg";
import { chainInfo } from "@/config/chainConfig";
import {
  cutOut,
  getWeb3,
  formatUnits,
  getHead,
  copyTxt,
  reducer,
} from "@/utils";
import { ethers } from "ethers";
import { useActiveWeb3React } from "@/hooks";
import { apiEtherscanService } from "@/api";
const initialState = {
  visible: false,
};
interface Iprops {
  details: any;
}
const Index = (props: Iprops) => {
  const { details } = props;
  const [form] = Form.useForm();
  const { Account } = useModel("global", ({ Account }: any) => ({
    Account,
  }));
  const { drawerVisible, activeAccount } = useModel(
    "accountDrawer",
    ({ drawerVisible, activeAccount }) => ({
      drawerVisible,

      activeAccount,
    })
  );
  const { account, library, chainId }: any = useActiveWeb3React();
  const List = Account.filter((item: any) => item.Status === "Success");
  const accountSelected = activeAccount || List[0];
  const address = ethers.utils.computeAddress("0x" + accountSelected.PubKey);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { visible } = state;
  const onCancel = () => {
    dispatch({ visible: false });
  };
  const gPlaceholder1 = useIntl().formatHTMLMessage({ id: "g.placeholder1" });
  const apiEtherscan = async (address) => {
    const res = await apiEtherscanService(address);
    form.setFieldsValue({
      abi: res.result,
    });
  };
  const getMethod = useMemo(() => {
    form.setFieldsValue({ method: null });
    let option = [];
    try {
      option = JSON.parse(form.getFieldValue("abi")) || [];
    } catch (e) {}
    debugger;
    return option.filter(
      // (item) => item.type === "function" && item.stateMutability === "view"
      (item) => item.name
    );
  }, [form.getFieldValue("abi")]);

  const getMethodInput = () => {};

  console.info('form.getFieldValue("abi")', form.getFieldValue("abi"));
  return (
    <>
      <Button size="large" onClick={() => dispatch({ visible: true })}>
        <img src={Icon2} />
        Contract ABI
      </Button>
      <Modal forceRender visible={visible} onCancel={onCancel} footer={false}>
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

          <p style={{ color: "rgba(0, 0, 0, 0.54)", marginTop: 20 }}>
            Contract address*
          </p>
          <Form form={form} name="control-hooks">
            <Form.Item name="TokenAddress" rules={[{ required: true }]}>
              <Input
                size="large"
                placeholder={gPlaceholder1 as string}
                onChange={(e) => apiEtherscan(e.target.value)}
              />
            </Form.Item>
            <p style={{ color: "rgba(0, 0, 0, 0.54)", marginTop: 20 }}>ABI*</p>
            <Form.Item name="abi" rules={[{ required: true }]}>
              <Input.TextArea
                rows={6}
                size="large"
                placeholder={gPlaceholder1 as string}
              />
            </Form.Item>
            {console.info("getMethod", getMethod)}
            {Boolean(getMethod.length) && (
              <>
                <p style={{ color: "rgba(0, 0, 0, 0.54)", marginTop: 20 }}>
                  Method*
                </p>
                <Form.Item name="method" rules={[{ required: true }]}>
                  <Select
                    showSearch
                    placeholder="Method"
                    optionFilterProp="label"
                  >
                    {getMethod.map((r) => (
                      <Select.Option value={r.name} label={r.name}>
                        <div className="flex_SB">
                          <span>{r.name}</span>
                          <span>
                            {r.stateMutability === "view" && "read"}
                            {r.stateMutability === "nonpayable" && "write"}
                          </span>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                padding: "0 75px",
                borderTop: "1px solid #f0f0f0",
                paddingTop: 20,
              }}
            >
              <Button>取消</Button>&nbsp;
              <Button type="primary" htmlType="submit">
                确认
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default Index;
