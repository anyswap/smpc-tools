import { Table, Badge, Button } from "antd";
import React, { useEffect, useState } from "react";
import { Tabs } from "antd";
import AccountList from "./index";
import TradingList from "./trading";
import { useIntl, useModel } from "umi";

const Index = () => {
  const { pollingRsvInfo, pollingPubKeyInfo } = useModel(
    "global",
    ({ pollingRsvInfo, pollingPubKeyInfo }) => ({
      pollingRsvInfo,
      pollingPubKeyInfo,
    })
  );
  // const [RsvInfo, setRsvInfoInfo] = useState(pollingRsvInfo);

  // useEffect(() => {
  //   setRsvInfoInfo(pollingRsvInfo);
  //   debugger;
  // }, [pollingRsvInfo]);
  // console.info("RsvInfo", RsvInfo);
  return (
    <Tabs defaultActiveKey={"0"}>
      <Tabs.TabPane
        key={"0"}
        tab={
          <Badge count={pollingPubKeyInfo} overflowCount={100}>
            <Button type="text">
              {useIntl().formatHTMLMessage({ id: "accountApproval" })}
            </Button>
          </Badge>
        }
      >
        <AccountList />
      </Tabs.TabPane>
      <Tabs.TabPane
        key={"1"}
        tab={
          <Badge count={pollingRsvInfo} overflowCount={100}>
            <Button type="text">
              {useIntl().formatHTMLMessage({ id: "tradingApproval" })}
            </Button>
          </Badge>
        }
      >
        <TradingList />
      </Tabs.TabPane>
    </Tabs>
  );
};

export default Index;
