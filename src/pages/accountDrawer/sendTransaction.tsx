import React, { useState } from "react";
import { Button, Modal } from "antd";
import Icon1 from "./img/icon1.svg";
import Icon2 from "./img/icon2.svg";
import SendFunds from "./components/sendFunds";
import SendContract from "./components/sendContract";
import { Interface } from "@ethersproject/abi";

interface Iprops {
  details: any;
}

const Index = (props: Iprops) => {
  const [typeOpen, setTypeOpen] = useState(false);
  return (
    <div className="sendTransaction-box">
      <Button type="primary" onClick={() => setTypeOpen(true)}>
        Send Transaction
      </Button>
      <Modal
        title={<span>&nbsp;</span>}
        open={typeOpen}
        onCancel={() => setTypeOpen(false)}
        footer={false}
      >
        <div className="sendTransaction-box-btns mb20">
          <SendFunds details={props.details} setTypeOpen={setTypeOpen} />
          <br />
          <br />

          <SendContract details={props.details} setTypeOpen={setTypeOpen} />
        </div>
      </Modal>
    </div>
  );
};

export default Index;
