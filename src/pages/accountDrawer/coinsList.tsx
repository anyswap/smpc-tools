import { Breadcrumb, Table, Button } from "antd";
import web3 from "@/assets/js/web3";
const Web3 = require("web3");
import React, { useEffect, useState } from "react";
import { chainInfo } from "@/config/chainConfig";
import { useActiveWeb3React } from "@/hooks";
import { abi } from "@/assets/js/web3";
import { useModel, useIntl } from "umi";
import { ethers } from "ethers";
console.info("chainInfo", chainInfo);

const Index = (props: { item: any }) => {
  const { account, library, chainId }: any = useActiveWeb3React();
  const [coinsInfo, setCoinsInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const { activeAccount } = useModel(
    "accountDrawer",
    ({ activeAccount }: any) => ({
      activeAccount,
    })
  );

  const getInfo = async (address: string) => {
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
    contract.options.address = address;
    const decimals = await contract.methods.decimals().call();
    const symbol = await contract.methods.symbol().call();
    const name = await contract.methods.name().call();
    const balance = await contract.methods
      .balanceOf(ethers.utils.computeAddress("0x" + props.item.PubKey))
      .call();
    return { decimals, symbol, balance, name };
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
    let obj: any = {};
    coins.forEach(async (item) => {
      setLoading(true);
      const { contract } = item;
      const info = await getInfo(contract);
      obj[contract] = info;
      console.info("obj", obj);
      if (Object.entries(obj).length === coins.length) {
        setLoading(false);
        setCoinsInfo(obj);
      }
    });
  }, [props.item, chainId]);
  const coins = [
    {
      name: "Ether",
      symbol: "ETH",
      logo: require("@/assets/images/coin/source/ETH.svg"),
      contract: "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
    },
    {
      name: "BTCB",
      symbol: "BTCB",
      logo: require("@/assets/images/coin/source/BTC.png"),
      contract: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
    },
    {
      name: "USDC",
      symbol: "USDC",
      logo: require("@/assets/images/coin/source/USDC.png"),
      contract: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    },
    {
      name: "USDT",
      symbol: "USDT",
      logo: require("@/assets/images/coin/source/USDT.png"),
      contract: "0x55d398326f99059ff775485246999027b3197955",
    },
    {
      name: "DAI",
      symbol: "DAI",
      logo: require("@/assets/images/coin/source/DAI.png"),
      contract: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
    },
    {
      name: "MIM",
      symbol: "MIM",
      logo: require("@/assets/images/coin/source/MIM.png"),
      contract: "0xfe19f0b51438fd612f6fd59c1dbb3ea319f433ba",
    },
    // {
    //   name: "MAI",
    //   symbol: "MAI",
    //   logo: require("@/assets/images/coin/source/MAI.png"),
    //   contract: "0x3f56e0c36d275367b8c502090edf38289b3dea0d",
    // },
  ];
  const columns = [
    {
      title: "ASSET",
      dataIndex: "name",
      width: "34%",
      render: (t: any, r: any) => {
        return (
          <>
            <img src={r.logo} width={26} />
            {coinsInfo?.[r.contract]?.name}
          </>
        );
      },
    },
    {
      title: "BALANCE",
      dataIndex: "contract",
      width: "34%",
      render: (t: string) => {
        const info = coinsInfo?.[t];
        return `${info?.balance || ""} ${info?.symbol || ""}`;
      },
    },
    {
      title: "",
      dataIndex: "contract",
      render: (t: string) => (
        <Button type="primary" size="small">
          Send
        </Button>
      ),
    },
  ];
  return (
    <>
      <Breadcrumb>
        <Breadcrumb.Item>Assets</Breadcrumb.Item>
        <Breadcrumb.Item>Coins</Breadcrumb.Item>
      </Breadcrumb>
      <Table
        loading={loading}
        pagination={false}
        dataSource={coins}
        columns={columns}
        rowKey="contract"
      />
    </>
  );
};

export default Index;
