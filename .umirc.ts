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
              path: "/demo",
              component: "@/pages/demo/index.tsx",
            },
            {
              path: "/Account",
              component: "@/pages/account",
            },
            {
              path: "/approval",
              component: "@/pages/approval/tabs",
            },
            {
              path: "/approvaled",
              component: "@/pages/approvaled/tabs",
            },
            {
              path: "/createGrounp",
              component: "@/pages/createGrounp",
            },
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
