import { Form, Select, Row, Col, Input, Button, Steps } from "antd";
import React, { useReducer } from "react";
import { useActiveWeb3React } from "@/hooks";
import "./style.less";

const initialState = {};
const Index = () => {
  const { account } = useActiveWeb3React();
  const [state, dispatch] = useReducer(
    (s, a) => ({ ...s, ...a }),
    initialState
  );
  return (
    <div className="box">
      <br />
      <Form size="large">
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
            style={{ width: "50%" }}
          />
        </Form.Item>
        {/* <Form.Item name="b" label="审批模式" initialValue="随机模式">
            <Select
              options={[
                {
                  value: "随机模式",
                },
                {
                  value: "先到先得",
                },
                {
                  value: "固定审批",
                },
              ]}
              style={{ width: "50%" }}
            />
          </Form.Item> */}
        <Row>
          <Col span={16}>Address</Col>
          <Col span={7} offset={1}>
            nodeRpc
          </Col>
        </Row>
        <Row>
          <Col span={16}>
            <Input value={account} />
          </Col>
          <Col span={7} offset={1}>
            <Input placeholder="nodeRpc" />
          </Col>
        </Row>
        <Button type="link" className="btn_center">
          {" "}
          + Add another owner
        </Button>
        <div className="flex_SB">
          <span>
            <Form.Item name="ThresHold" initialValue={"2/2"}>
              <Select
                initialValue="2/2"
                style={{ width: 100 }}
                options={[{ value: "2/2", label: "2/2" }]}
              />
            </Form.Item>
          </span>
          <span>
            <Button type="primary">Create SMPC</Button>&nbsp;
            <Button>Reset</Button>
          </span>
        </div>
      </Form>
    </div>
  );
};

export default Index;
