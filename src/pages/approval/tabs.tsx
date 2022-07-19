import React, { useState, useEffect } from "react";
import { Tabs, Badge } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import AccountList from "./index";
import TradingList from "./trading";
import { useIntl, useModel } from "umi";

const Index = () => {
  const [spin, setSpin] = useState(false);
  const { getData, approveList, tradingList } = useModel(
    "approval",
    ({ getData, approveList, tradingList }) => {
      return { getData, approveList, tradingList };
    }
  );

  const refresh = () => {
    setSpin(true);
    getData();
    setTimeout(() => {
      setSpin(false);
    }, 500);
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
        tab={
          <Badge
            count={approveList.length}
            overflowCount={100}
            offset={[8, 0]}
            showZero={false}
          >
            {useIntl().formatHTMLMessage({ id: "accountApproval" })}
          </Badge>
        }
      >
        <AccountList />
      </Tabs.TabPane>
      <Tabs.TabPane
        key={"1"}
        tab={
          <Badge
            count={tradingList.length}
            overflowCount={100}
            offset={[8, 0]}
            showZero={false}
          >
            {useIntl().formatHTMLMessage({ id: "tradingApproval" })}
          </Badge>
        }
      >
        <TradingList />
      </Tabs.TabPane>
    </Tabs>
  );
};

export default Index;
