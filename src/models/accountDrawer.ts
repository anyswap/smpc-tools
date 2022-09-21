import { reducer } from "@/utils";
import { useReducer, useEffect } from "react";
const Account = JSON.parse(localStorage.getItem("Account") || "[]");
const initialState = {
  drawerVisible: false,
  activeAccount: null,
  selectedKeys: Account.filter((item: any) => item.Status === "Success").length
    ? ["Coins"]
    : ["CreateGrounp"],
};

export default function Index() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return { ...state, dispatch };
}
