import { defineConfig } from "umi";

const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  favicon: "./favicon.ico",
  title: "Multichain - SMPC",
  history: { type: "hash" },
  nodeModulesTransform: {
    type: "none",
  },
  extraBabelPlugins: [isProd ? "transform-remove-console" : ""],
  routes: [
    {
      path: "/",
      component: "@/pages/app.tsx",
      routes: [
        // {
        //   path: "/",
        //   component: "@/pages/index/index.tsx",
        // },
        // {
        //   path: "/login",
        //   component: "@/pages/login/index.tsx",
        // },
        {
          path: "/",
          component: "@/pages/index",
        },
        {
          path: "/",
          component: "@/pages/layouts/index",
          routes: [
            {
              path: "/CreateNewSMPC",
              component: "@/pages/CreateNewSMPC/index.tsx",
            },
            {
              path: "/Coins",
              component: "@/pages/Components/CoinList/index.tsx",
            },
            {
              // path: "/demo",
              component: "@/pages/404.tsx",
            },
            // {
            //   path: "/Account",
            //   component: "@/pages/accountDrawer/index.tsx",
            // },
            // {
            //   path: "/approval",
            //   component: "@/pages/approval/tabs",
            // },
            // {
            //   path: "/approvaled",
            //   component: "@/pages/approvaled/tabs",
            // },
            // {
            //   path: "/createGrounp",
            //   component: "@/pages/createGrounp",
            // },
          ],
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
  locale: {
    antd: true,
  },
});
