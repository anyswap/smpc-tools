import { Steps } from "antd";
import React from "react";
import Create from "./create";

const Index = () => {
  return (
    <div className="create-new-smpc">
      <Steps direction="vertical" className="steps" current={1}>
        <Steps.Step title="Create SMPC" description={<Create />} key={0} />
        <Steps.Step title="Review" description="ReviewReview" key={1} />
      </Steps>
    </div>
  );
};

export default Index;
