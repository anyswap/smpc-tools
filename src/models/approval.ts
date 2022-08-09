import { reducer } from "@/utils";
import React, { useReducer, useEffect } from "react";
import web3 from "@/assets/js/web3";
import { useActiveWeb3React } from "@/hooks";

const initialState = {
  approveList: [],
  approveListLoading: false,
  tradingList: [],
  tradingListLoading: false,
};

export default function Index() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const account = window.ethereum?.selectedAddress;
  // const { account } = useActiveWeb3React();
  const { rpc } = JSON.parse(localStorage.getItem("loginAccount") || "{}");

  const getCurNodeReqAddrInfoResponse = (e: any, res: any) => {
    if (e) return;
    const { Data } = res;
    dispatch({
      approveList: (Data || []).sort(
        (a: any, b: any) => Number(b.TimeStamp) - Number(a.TimeStamp)
      ),
      approveListLoading: false,
    });
  };
  const getCurNodeSignInfoResponse = (e: any, res: any) => {
    if (e) return;
    dispatch({
      tradingListLoading: true,
    });
    dispatch({
      tradingList: res?.Data || [],
      tradingListLoading: false,
    });
  };
  const getData = () => {
    if (!rpc || !account) return;
    web3.setProvider(rpc);
    const batch = new web3.BatchRequest();
    batch.add(
      web3.smpc.getCurNodeReqAddrInfo.request(
        account,
        getCurNodeReqAddrInfoResponse
      )
    );
    batch.add(
      web3.smpc.getCurNodeSignInfo.request(account, getCurNodeSignInfoResponse)
    );
    batch.execute();
    dispatch({
      approveListLoading: true,
    });
  };
  useEffect(() => {
    if (account) getData();
  }, [account]);
  useEffect(() => {
    // 20秒调一次交易账户审批列表和交易审批列表
    const interval = setInterval(() => {
      if (!rpc || !account) return;
      getData();
    }, 20000);
    return () => {
      clearInterval(interval);
    };
  }, [account]);

  return { ...state, getData };
}
