import { Table } from "antd";
import React from "react";
import { Tabs } from "antd";
import AccountList from "./index";
import TradingList from "./trading";
import { useIntl } from "umi";

const Index = () => {
  return (
    <Tabs defaultActiveKey={"0"}>
      <Tabs.TabPane
        key={"0"}
        tab={useIntl().formatHTMLMessage({ id: "accountApproval" })}
      >
        <AccountList />
      </Tabs.TabPane>
      <Tabs.TabPane
        key={"1"}
        tab={useIntl().formatHTMLMessage({ id: "tradingApproval" })}
      >
        <TradingList />
      </Tabs.TabPane>
    </Tabs>
  );
};

export default Index;
