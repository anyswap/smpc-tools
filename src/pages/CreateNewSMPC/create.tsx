import { Form, Select, Row, Col, Input, Button, Steps } from "antd";
import React, { useReducer, useEffect } from "react";
import { useActiveWeb3React } from "@/hooks";
import "./style.less";
import { DeleteOutlined } from "@ant-design/icons";
import { nodeListService } from "@/api";

const initialState = { nodeList: [] };
interface Iprops {
  style?: {};
}
const Index = (props: Iprops) => {
  const { style = {} } = props;
  const { account } = useActiveWeb3React();
  const [state, dispatch] = useReducer(
    (s: any, a: any) => ({ ...s, ...a }),
    initialState
  );
  const { nodeList } = state;
  const [form] = Form.useForm();
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
    <div className="box" style={style}>
      <br />
      <Form
        size="large"
        name="smpc"
        form={form}
        onFinish={(v) => {
          debugger;
        }}
      >
        <Row>
          <Col span={3}>
            Name<span className="red">*</span>
          </Col>
          <Col span={12} offset={1}>
            Address<span className="red">*</span>
          </Col>
          <Col span={6} offset={1}>
            RPC/Node Name
          </Col>
        </Row>
        <Row className="mt5">
          <Col span={3}>
            <Form.Item
              name={"aa"}
              rules={[
                { required: true, whitespace: true, message: "Missing name" },
                {
                  max: 20,
                  min: 1,
                  whitespace: true,
                  message: "1 to 20 lengths",
                },
              ]}
            >
              <Input placeholder="name" />
            </Form.Item>
          </Col>
          <Col span={12} offset={1}>
            <Input value={account || ""} disabled />
          </Col>
          <Col span={5} offset={1}>
            <Form.Item
              name="b"
              rules={[
                {
                  validator: (_, value) => {
                    if (value?.length > 5) {
                      return Promise.reject(new Error("Up to 5"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Select
                mode="tags"
                optionLabelProp="label"
                maxTagCount={3}
                placeholder="RPC/Node Name"
              >
                {nodeList.map((r: any) => (
                  <Select.Option value={r.name} label={r.name} key={r._id}>
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
        <Form.List name="accouts" initialValue={[{}]}>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Row className="mt10" key={key}>
                  {console.info("restField==========", {
                    key,
                    name,
                    ...restField,
                  })}
                  <Col span={3}>
                    <Form.Item
                      {...restField}
                      name={[name, "name"]}
                      rules={[
                        { required: true, message: "Missing first name" },
                      ]}
                    >
                      <Input placeholder="name" />
                    </Form.Item>
                  </Col>
                  <Col offset={1} span={12}>
                    <Form.Item
                      {...restField}
                      name={[name, "address"]}
                      rules={[
                        { required: true, message: "Missing first name" },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={5} offset={1}>
                    <Form.Item
                      {...restField}
                      name={[name, "node"]}
                      rules={[{ required: true, message: "Missing last name" }]}
                    >
                      <Select
                        mode="tags"
                        optionLabelProp="label"
                        maxTagCount={3}
                        placeholder="RPC/Node Name"
                      >
                        {nodeList.map((r: any) => (
                          <Select.Option
                            value={r.name}
                            label={r.name}
                            key={r._id}
                          >
                            <div className="flex_SB">
                              <span
                                title={r.name}
                                style={{
                                  display: "inline-block",
                                  width: "60%",
                                  textOverflow: "ellipsis",
                                  overflow: "hidden",
                                }}
                              >
                                {r.name}
                              </span>
                              <span>
                                {r.createNum === 0
                                  ? "-"
                                  : `${(
                                      ((r.createNum - r.createFailNum) /
                                        r.createNum) *
                                      100
                                    ).toFixed(2)}%`}
                              </span>
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
              <Button
                disabled={fields.length === 6}
                type="link"
                onClick={add}
                className="btn_center"
              >
                + Add another owner
              </Button>

              <div className="flex_SB">
                <span>
                  <Form.Item
                    key={fields.length}
                    name="ThresHold"
                    initialValue={`2/${fields.length + 1}`}
                  >
                    <Select
                      style={{ width: 100 }}
                      options={fields.map((item, i) => ({
                        value: `${i + 2}/${fields.length + 1}`,
                      }))}
                    />
                  </Form.Item>
                </span>
                <span>
                  <Button
                    type="primary"
                    htmlType="submit"
                    onClick={() => console.info(form.getFieldsValue())}
                  >
                    Create SMPC
                  </Button>
                  &nbsp;
                  <Button>Reset</Button>
                </span>
              </div>
            </>
          )}
        </Form.List>
      </Form>
    </div>
  );
};

export default Index;
