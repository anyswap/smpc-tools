import React, { Dispatch } from "react";
import { LeftOutlined } from "@ant-design/icons";
// import Logo_png from '@/pages/img/logo.svg';
import Logo_png from "@/pages/img/logo.svg";
import "./style.less";

interface Iprops {
  dispatch?: Dispatch<any>;
  name: string;
}
const Index = (props: Iprops) => {
  const { dispatch, name } = props;
  return (
    <div className="modal-head">
      <div className="title">
        <img src={Logo_png} width={35} />
        <span className="left">密钥</span>
        <span className="right">管家</span>
      </div>
      <div className="back">
        <span onClick={() => dispatch && dispatch({ visible: false })}>
          <LeftOutlined />
          Back
        </span>
      </div>
      <div className="action">{name}</div>
    </div>
  );
};
export default Index;
