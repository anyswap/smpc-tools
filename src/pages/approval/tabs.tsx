import React, { useState } from "react";
import { Tabs } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import AccountList from "./index";
import TradingList from "./trading";
import { useIntl } from "umi";

const Index = () => {
  const [num, setNum] = useState(0);
  const [spin, setSpin] = useState(false);
  const refresh = () => {
    setSpin(true);
    setTimeout(() => {
      setSpin(false);
    }, 500);
    setNum(num + 1);
  };
  return (
    <Tabs
      defaultActiveKey={"0"}
      tabBarExtraContent={
        <span className="mr5">
          <RedoOutlined
            spin={spin}
            className="fs18 cursor_pointer"
            onClick={refresh}
          />
        </span>
      }
      destroyInactiveTabPane
    >
      <Tabs.TabPane
        key={"0"}
        tab={useIntl().formatHTMLMessage({ id: "accountApproval" })}
      >
        <AccountList num={num} />
      </Tabs.TabPane>
      <Tabs.TabPane
        key={"1"}
        tab={useIntl().formatHTMLMessage({ id: "tradingApproval" })}
      >
        <TradingList num={num} />
      </Tabs.TabPane>
    </Tabs>
  );
};

export default Index;
