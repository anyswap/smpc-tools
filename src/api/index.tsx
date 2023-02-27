import config from "@/config";
import { request } from "umi";

export const nodeListService = () => request(`${config.appURL}/nodes/list`);

export const apiEtherscanService = (address: string) =>
  request(
    `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=YourApiKeyToken`
  );
