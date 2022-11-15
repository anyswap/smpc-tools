import { Form, Select, Row, Col, Input, Button, Steps } from "antd";
import React, { useReducer, useEffect } from "react";
import { useActiveWeb3React } from "@/hooks";
import "./style.less";
import { DeleteOutlined } from "@ant-design/icons";
import { nodeListService } from "@/api";

const initialState = { nodeList: [] };
const Index = () => {
  const { account } = useActiveWeb3React();
  const [state, dispatch] = useReducer(
    (s, a) => ({ ...s, ...a }),
    initialState
  );
  const { nodeList } = state;
  const [form] = Form.useForm();
  console.info("nodeList", nodeList);
  const getNodeList = async () => {
    const res = await nodeListService();
    dispatch({
      nodeList: res.info,
    });
  };

  useEffect(() => {
    getNodeList();
    const interval = setInterval(() => {
      getNodeList();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="box">
      <br />
      <Form size="large" name="smpc" form={form}>
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
          <Col span={15}>
            Address<span className="red">*</span>
          </Col>
          <Col span={6} offset={1}>
            RPC/Node Name<span className="red">*</span>
          </Col>
        </Row>
        <Row className="mt5 mb35">
          <Col span={15}>
            <Input value={account} />
          </Col>
          <Col span={6} offset={1}>
            <Form.Item
              name="b"
              rules={[{ required: true, message: "Missing last name" }]}
            >
              <Select
                mode="tags"
                optionLabelProp="label"
                maxTagCount={3}
                placeholder="RPC/Node Name"
              >
                {nodeList.map((r: any) => (
                  <Select.Option value={r.name} label={r.name}>
                    <div className="flex_SB">
                      <span>{r.name}</span>
                      <span>{`${(
                        ((r.createNum - r.createFailNum) / r.createNum) *
                        100
                      ).toFixed(2)}%`}</span>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.List name="accouts">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Row className="mt10" key={key}>
                  {console.info("restField==========", {
                    key,
                    name,
                    ...restField,
                  })}
                  <Col span={15}>
                    <Form.Item
                      {...restField}
                      name={[name, "first"]}
                      rules={[
                        { required: true, message: "Missing first name" },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6} offset={1}>
                    <Form.Item
                      {...restField}
                      name={[name, "last"]}
                      rules={[{ required: true, message: "Missing last name" }]}
                    >
                      <Select
                        mode="tags"
                        optionLabelProp="label"
                        maxTagCount={3}
                        placeholder="RPC/Node Name"
                      >
                        {nodeList.map((r: any) => (
                          <Select.Option value={r.name} label={r.name}>
                            <div className="flex_SB">
                              <span>{r.name}</span>
                              <span>{`${(
                                ((r.createNum - r.createFailNum) /
                                  r.createNum) *
                                100
                              ).toFixed(2)}%`}</span>
                            </div>
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  {fields.length > 1 && (
                    <Col span={2} className="del-prent">
                      <DeleteOutlined
                        onClick={() => remove(name)}
                        className="cursor_pointer"
                      />
                    </Col>
                  )}
                </Row>
              ))}
              <Button type="link" onClick={add} className="btn_center">
                + Add another owner
              </Button>
            </>
          )}
        </Form.List>

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
            <Button
              type="primary"
              onClick={() => console.info(form.getFieldsValue())}
            >
              Create SMPC
            </Button>
            &nbsp;
            <Button>Reset</Button>
          </span>
        </div>
      </Form>
    </div>
  );
};

export default Index;
