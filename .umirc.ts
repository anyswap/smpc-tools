import { defineConfig } from "umi";

export default defineConfig({
  favicon: "./favicon.ico",
  title: "Multichain - SMPC",
  nodeModulesTransform: {
    type: "none",
  },
  routes: [
    {
      path: "/",
      component: "@/pages/index/index.tsx",
    },
    {
      path: "/login",
      component: "@/pages/login/index.tsx",
    },
    {
      path: "/",
      component: "@/pages/layouts/index",
      routes: [
        {
          path: "/getEnode",
          component: "@/pages/getEnode",
        },
        {
          path: "/approvalList",
          component: "@/pages/approvalList",
        },
        {
          path: "/createGrounp",
          component: "@/pages/createGrounp",
        },
      ],
    },
  ],
  fastRefresh: {},
  // locale: {
  //   default: 'en-US',
  //   antd: true,
  //   title: false,
  //   baseNavigator: false,
  //   baseSeparator: '-'
  // },
  locale: {},
});
