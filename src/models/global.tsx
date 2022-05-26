import { nodeListService } from "@/api";
import config from "@/config";
import { reducer } from "@/utils";
import { useEffect, useReducer } from "react";
import moment from "moment";

const initState = {
  address: "",
  loginAccount: {
    enode:
      "enode://ccb6824beb1fb66d7d8ded5d230ad91bc0ffb96bc4519083e4185fb1b980ea1344b73df2003f9bd0ff885a26ba7f29d628a2b8b429260896ff140f832adbe6b3@49.235.123.22:48527",
    signEnode: "",
  },
  nodeList: [],
  isDay:
    moment().format("YYYY-MM-DD HH:mm:ss") <
      moment().format("YYYY-MM-DD 21:00:00") &&
    moment().format("YYYY-MM-DD HH:mm:ss") >
      moment().format("YYYY-MM-DD 05:30:00"),
};

export default function Index() {
  const [state, dispatch] = useReducer(reducer, initState);
  console.info("configappURL", config.appURL);

  const getNodeList = async () => {
    const res = await nodeListService();
    dispatch({
      nodeList: res.info,
    });
  };

  useEffect(() => {
    // '/nodes/list'
    getNodeList();
  }, []);

  return { ...state, globalDispatch: dispatch };
}
