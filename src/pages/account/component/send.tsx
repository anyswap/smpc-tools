import React, { useEffect } from "react";
import { Modal, Form, Input } from "antd";
import { useIntl } from "umi";

const Index = (props: {
  visible: boolean;
  onSend: any;
  setVisible: (visible: boolean) => void;
  balance: number;
}) => {
  const { visible, onSend, setVisible, balance } = props;
  console.info("balancebalance", balance);

  const [form] = Form.useForm();

  const onFinish = async (v: { to: string; value: string }) => {
    const res = await onSend(v.to, v.value);
    if (res) setVisible(false);
  };
  const rules2 = useIntl().formatHTMLMessage({ id: "login.rules2" });

  useEffect(() => {
    if (!visible) form.resetFields();
  }, [visible]);
  return (
    <Modal
      title={useIntl().formatHTMLMessage({ id: "transaction" })}
      visible={visible}
      onOk={form.submit}
      onCancel={() => setVisible(false)}
      forceRender
    >
      <Form
        form={form}
        labelCol={{ flex: "60px" }}
        onFinish={onFinish}
        name="send"
      >
        <Form.Item
          name="to"
          label="To"
          rules={[
            {
              required: true,
              message: useIntl().formatHTMLMessage({
                id: "g.required",
              }) as string,
            },
          ]}
        >
          <Input
            placeholder={
              useIntl().formatHTMLMessage({ id: "g.placeholder1" }) as string
            }
          />
        </Form.Item>
        <Form.Item
          name="value"
          label="Value"
          rules={[
            {
              required: true,
              message: useIntl().formatHTMLMessage({
                id: "g.required",
              }) as string,
            },
            {
              type: "number",
              validator: (r, v, c) => {
                // if (!isNaN(v) && Number(v) > 0 && balance >= Number(v)) {
                if (!isNaN(v) && Number(v) > 0) {
                  c();
                }
                c(rules2 as string);
              },
            },
          ]}
        >
          <Input
            placeholder={
              useIntl().formatHTMLMessage({ id: "g.placeholder1" }) as string
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Index;
