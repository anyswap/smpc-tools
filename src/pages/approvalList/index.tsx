import React from "react";
import { Tabs } from "antd";
import "./style.less";
import { Link, useIntl } from "umi";
import { ArrowRightOutlined } from "@ant-design/icons";

const Index = () => {
  return (
    // <Tabs defaultActiveKey="1" type="card">
    //   <Tabs.TabPane tab="共管账户信息" key="1">
    //     Content of card tab 1
    //   </Tabs.TabPane>
    //   <Tabs.TabPane tab="交易信息" key="2">
    //     Content of card tab 2
    //   </Tabs.TabPane>
    // </Tabs>
    <div className="approval-list">
      <div className="item">
        <span>
          社区共管1 <Link to>0x62bf....72f4</Link>
          <ArrowRightOutlined />
        </span>
        <span>
          社区共管2 <Link to>0x62bf....72f4</Link>
        </span>
        <br />
        <span>{useIntl().formatMessage({ id: "number" })}：2.00000Eth</span>
        <span>费用：0.00002Eth</span>
        <div className="action-box">
          <div className="left">赵婷婷、赵海等5人已经接受</div>
          <div className="right">
            <div className="yes">接受</div>
            <div className="no">拒绝</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
