import React, { useEffect } from "react";
import { Modal, Form, Input } from "antd";
import { useIntl } from "umi";

const Index = (props: {
  visible: boolean;
  onSend: any;
  setVisible: (visible: boolean) => void;
}) => {
  const { visible, onSend, setVisible } = props;

  const [form] = Form.useForm();

  const onFinish = (v: { to: string; value: string }) => {
    onSend(v.to, v.value);
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
    >
      <Form form={form} labelCol={{ flex: "60px" }} onFinish={onFinish}>
        <Form.Item
          name="to"
          label="to"
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
          label="value"
          rules={[
            {
              required: true,
              message: useIntl().formatHTMLMessage({
                id: "g.required",
              }) as string,
            },
            {
              required: true,
              type: "number",
              validator: (r, v, c) => {
                if (!isNaN(v)) {
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
