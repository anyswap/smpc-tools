import config from "@/config/index.js";
const Web3 = require("web3");
let web3Fn = new Web3(new Web3.providers.HttpProvider(config.rpc));

export default web3Fn;
