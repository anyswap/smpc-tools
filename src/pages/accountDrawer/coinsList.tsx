import { Breadcrumb, Table, Button } from "antd";
import web3 from "@/assets/js/web3";
const Web3 = require("web3");
import React, { useEffect, useState } from "react";
import { chainInfo } from "@/config/chainConfig";
import { useActiveWeb3React } from "@/hooks";
import { abi } from "@/assets/js/web3";
import { useModel, useIntl } from "umi";
import { ethers } from "ethers";
import { coins } from "./config";
import SendContractRow from "./components/sendContractRow";

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
    console.info("chainInfo[chainId].nodeRpc", chainInfo[chainId].nodeRpc);
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
    // const decimals = await contract.methods.decimals().call();
    // const symbol = await contract.methods.symbol().call();
    // const name = await contract.methods.name().call();
    const balance = await contract.methods
      .balanceOf(ethers.utils.computeAddress("0x" + props.item.PubKey))
      .call();
    return { balance };
    // return { decimals, symbol, balance, name };
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
    coins[chainId].forEach(async (item) => {
      setLoading(true);
      const { contract } = item;
      const info = await getInfo(contract);
      obj[contract] = info;
      console.info("obj", obj);
      if (Object.entries(obj).length === coins[chainId].length) {
        setLoading(false);
        setCoinsInfo(obj);
      }
    });
  }, [props.item, chainId]);

  const columns = [
    {
      title: "ASSET",
      dataIndex: "name",
      width: "34%",
      render: (t: any, r: any) => {
        return (
          <>
            <img src={r.logo} width={26} />
            &nbsp;
            {coinsInfo?.[r.contract]?.name}
            {r.name}
          </>
        );
      },
    },
    {
      title: "BALANCE",
      dataIndex: "contract",
      width: "34%",
      render: (t: string, r) => {
        const info = coinsInfo?.[t];
        return `${info?.balance || ""} ${r?.symbol || ""}`;
      },
    },
    {
      title: "",
      dataIndex: "contract",
      render: (t: string) => (
        <SendContractRow TokenAddress={t}>
          <Button type="primary" size="small">
            Send
          </Button>
        </SendContractRow>
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
        dataSource={coins[chainId]}
        columns={columns}
        rowKey="contract"
      />
    </>
  );
};

export default Index;
