import { Steps } from "antd";
import React, { useState, useEffect, useMemo } from "react";
import Create from "./create";
import Connect from "@/pages/index";
import { useIntl } from "umi";
import { useActiveWeb3React } from "@/hooks";
import { PageContainer, ProCard } from "@ant-design/pro-components";

const Index = () => {
  const { account } = useActiveWeb3React();
  const [step, setStep] = useState(account ? 1 : 0);
  console.info("account===========", account);
  useEffect(() => {
    if (!account) setStep(0);
    if (account && step === 0) setStep(1);
  }, [account]);
  console.info("step=======", step);
  const getStyle = (index: number) =>
    useMemo(() => {
      return { display: step === index ? "block" : "none" };
    }, [step]);
  return (
    <PageContainer
      style={{ marginLeft: 320 }}
      header={{
        title: "Create SMPC",
      }}
    >
      <ProCard>
        <div className="create-new-smpc">
          <Steps
            direction="vertical"
            // onChange={setStep}
            className="steps"
            current={1}
          >
            <Steps.Step
              title={useIntl().formatHTMLMessage({ id: "connectThePurse" })}
              description={<Connect style={getStyle(0)} />}
              key={0}
            />
            <Steps.Step
              title="Create SMPC"
              description={<Create style={getStyle(1)} />}
              key={1}
            />
            <Steps.Step title="Review" description="ReviewReview" key={2} />
          </Steps>
        </div>
      </ProCard>
    </PageContainer>
  );
};

export default Index;
