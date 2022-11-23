import React from "react";

const Index = () => {
  const columns = [
    {
      title: "PubKey",
      dataIndex: "PubKey",
      width: "25%",
      render: (t: string) => {
        return cutOut(t, 8, 10);
      },
    },
    {
      title: "Address",
      dataIndex: "PubKey",
      width: "25%",
      render: (t: string) => {
        return ethers.utils.computeAddress("0x" + t);
        // return <span>{JSON.parse(details)[t]?.SmpcAddress?.ETH}</span>;
      },
    },
    {
      title: intl_balance,
      dataIndex: "PubKey",
      width: "10%",
      render: (t: string) =>
        formatUnits(details[t]?.balance || 0, 18) + chainInfo[chainId]?.symbol,
    },
    {
      title: intl_createDate,
      dataIndex: "TimeStamp",
      render: (t: string) => moment(Number(t)).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: intl_thresHold,
      dataIndex: "ThresHold",
      width: "10%",
    },
    {
      title: intl_action,
      width: "10%",
      render: (r: any) => <Button type="link">{intl_transaction}</Button>,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data
        .sort((a: any, b: any) => b.TimeStamp - a.TimeStamp)
        .map((item: any, i) => ({ ...item, k: i }))}
      rowKey="PubKey"
      key={Object.values(details).length}
      pagination={{
        total: data.length,
        hideOnSinglePage: true,
        pageSizeOptions: [10, 20, 50, 100],
        showSizeChanger: true,
        showQuickJumper: true,
      }}
    />
  );
};

export default Index;
