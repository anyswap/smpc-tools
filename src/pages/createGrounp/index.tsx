import { reducer } from "@/utils";
import { Input, Form, Select } from "antd";
import React, { useReducer } from "react";
import "./style.less";

const options = [1, 2, 3, 4, 5];
const initState = {
  admin: [],
};

const Index = () => {
  const [form] = Form.useForm();
  const [state, dispatch] = useReducer(reducer, initState);
  const { admin } = state;
  const typeChange = (v: number) => {
    let arr = [];
    for (let i = 1; i < v + 1; i++) {
      arr.push(i);
    }
    dispatch({
      admin: arr,
    });
  };

  return (
    <div className="create-grounp">
      <div className="left">
        <Input.Search />
      </div>
      <div className="right">
        <Form layout="vertical" form={form}>
          <Form.Item>
            <Select
              onChange={typeChange}
              options={options.map((i) => ({
                label: `${i}/${i}模式`,
                value: i,
              }))}
            />
          </Form.Item>
          {admin.map((i: number) => (
            <Form.Item label={`管理人${i}`}>
              <Input />
            </Form.Item>
          ))}
        </Form>
      </div>
    </div>
  );
};

export default Index;
