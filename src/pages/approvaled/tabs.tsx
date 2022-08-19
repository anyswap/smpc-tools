import { Table, Badge, Button } from "antd";
import React, { useEffect, useState } from "react";
import { Tabs } from "antd";
import AccountList from "./index";
import TradingList from "./trading";
import { useIntl, useModel } from "umi";
import { RedoOutlined } from "@ant-design/icons";

const Index = () => {
  const { getRsvSpin, getRsv } = useModel(
    "global",
    ({ getRsvSpin, getRsv }: any) => ({
      getRsvSpin,
      getRsv,
    })
  );
  const [activeKey, setActiveKey] = useState("0");
  console.info("process.env.NODE_ENV", process.env.NODE_ENV);
  useEffect(() => {
    if (activeKey === "1") getRsv();
  }, [activeKey]);
  return (
    <Tabs
      defaultActiveKey={"0"}
      onChange={setActiveKey}
      tabBarExtraContent={
        activeKey === "1" && (
          <span className="mr5">
            <RedoOutlined
              spin={getRsvSpin}
              className="fs18 cursor_pointer"
              onClick={getRsv}
            />
          </span>
        )
      }
    >
      <Tabs.TabPane
        key={"0"}
        tab={useIntl().formatHTMLMessage({ id: "accountApproval" })}
      >
        <AccountList />
      </Tabs.TabPane>
      <Tabs.TabPane
        key={"1"}
        tab={useIntl().formatHTMLMessage({ id: "nav.approvedTransaction" })}
      >
        <TradingList />
      </Tabs.TabPane>
    </Tabs>
    // <TradingList />
  );
};

export default Index;
