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
  const { rpc } = JSON.parse(localStorage.getItem("loginAccount") || "{}");

  const getApproveList = async () => {
    if (!rpc || !account) return;
    web3.setProvider(rpc);
    dispatch({
      approveListLoading: true,
    });
    const res = await web3.smpc.getCurNodeReqAddrInfo(account);
    const { Data } = res;
    dispatch({
      approveList: (Data || []).sort(
        (a: any, b: any) => Number(b.TimeStamp) - Number(a.TimeStamp)
      ),
      approveListLoading: false,
    });
  };
  const getCurNodeSignInfo = async () => {
    dispatch({
      tradingListLoading: true,
    });
    web3.setProvider(rpc);
    const res = await web3.smpc.getCurNodeSignInfo(account);
    dispatch({
      tradingList: res?.Data || [],
      tradingListLoading: false,
    });
  };
  useEffect(() => {
    getApproveList();
    getCurNodeSignInfo();
  }, [account]);

  useEffect(() => {
    const interval = setInterval(() => {
      getApproveList();
      getCurNodeSignInfo();
    }, 20000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return { ...state, getApproveList, getCurNodeSignInfo };
}
