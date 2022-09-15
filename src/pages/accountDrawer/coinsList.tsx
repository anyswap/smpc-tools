import { Breadcrumb, Table } from "antd";
import web3 from "@/assets/js/web3";
const Web3 = require("web3");
import { useEffect } from "react";
import { chainInfo } from "@/config/chainConfig";
import { useActiveWeb3React } from "@/hooks";
import { abi } from "@/assets/js/web3";

const Index = () => {
  const { account, library, chainId }: any = useActiveWeb3React();

  const getInfo = () => {
    let web3;
    let currentProvider = new Web3.providers.HttpProvider(
      chainInfo[chainId].nodeRpc
    );
    try {
      web3 = new Web3(currentProvider);
    } catch (error) {
      web3 = new Web3();
    }
    const contract = new web3.eth.Contract(abi);
    contract.options.address = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
    debugger;

    // const symbol = await contract.methods.symbol().call();
    // contract.methods.balanceOf(address).call(async (e: any, r: any) => {
    //   if (e) return;
    //   // const chainDetial = chainInfo[web3.utils.hexToNumber(chainId)];

    //   const decimals = await contract.methods.decimals().call();
    //   const balance = ethers.utils.formatUnits(r, decimals);
    //   if (Number(v.value) > Number(balance)) {
    //     message.error(`Not sufficient funds, Balance: ${balance}`);
    //     return;
    //   }
    //   const res = await onSend(v.to, v.value, v.TokenAddress, symbol);
    //   if (res) setVisible(false);
    // });
  };
  useEffect(() => {
    getInfo();
  }, []);

  return (
    <>
      <Breadcrumb>
        <Breadcrumb.Item>Assets</Breadcrumb.Item>
        <Breadcrumb.Item>Coins</Breadcrumb.Item>
      </Breadcrumb>
      <Table
        pagination={false}
        dataSource={[{ a: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599" }]}
        showHeader={false}
      />
    </>
  );
};

export default Index;
