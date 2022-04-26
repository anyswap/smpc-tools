import React from "react";
import "./index.less";

interface Iprops {
  key: string;
  header: string;
  icon: string;
  onClick: () => void;
}

const Index = (props: Iprops) => {
  const { key, header, icon, onClick } = props;
  return (
    <div className="wallet-option" onClick={onClick}>
      <span>{header}</span>
      <img src={icon} width={24} />
    </div>
  );
};

export default Index;
