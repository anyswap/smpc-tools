import React from "react";
import { message } from "antd";
import { RequestConfig } from "umi";
export const request: RequestConfig = {
  timeout: 10000,
  errorConfig: {},
  middlewares: [],
  requestInterceptors: [],
  responseInterceptors: [],
  errorHandler: (e) => {
    message.error(e.toString());
    return { info: [], success: false };
  },
};
