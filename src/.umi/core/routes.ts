// @ts-nocheck
import React from "react";
import { ApplyPluginsType } from "D:/Works/dcrm/smpc-tools/node_modules/_@umijs_runtime@3.5.23@@umijs/runtime";
import * as umiExports from "./umiExports";
import { plugin } from "./plugin";

export function getRoutes() {
  const routes = [
    {
      path: "/",
      component: require("@/pages/app.tsx").default,
      routes: [
        {
          path: "/",
          component: require("@/pages/index/index.tsx").default,
          exact: true,
        },
        {
          path: "/login",
          component: require("@/pages/login/index.tsx").default,
          exact: true,
        },
        {
          path: "/",
          component: require("@/pages/layouts/index").default,
          routes: [
            {
              path: "/getEnode",
              component: require("@/pages/getEnode").default,
              exact: true,
            },
            {
              path: "/approval",
              component: require("@/pages/approval").default,
              exact: true,
            },
            {
              path: "/createGrounp",
              component: require("@/pages/createGrounp").default,
              exact: true,
            },
          ],
        },
      ],
    },
  ];

  // allow user to extend routes
  plugin.applyPlugins({
    key: "patchRoutes",
    type: ApplyPluginsType.event,
    args: { routes },
  });

  return routes;
}
