import config from "@/config";
import { request } from "umi";

export const nodeListService = () => request(`${config.appURL}/nodes/list`);
