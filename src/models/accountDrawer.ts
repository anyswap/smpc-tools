import { reducer } from "@/utils";
import { useReducer, useEffect } from "react";

const initialState = {
  drawerVisible: false,
  activeAccount: null,
};

export default function Index() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return { ...state, dispatch };
}