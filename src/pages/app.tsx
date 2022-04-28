import React from "react";
import { createWeb3ReactRoot, Web3ReactProvider } from "@web3-react/core";
// src\component\Web3ReactManager
import Web3ReactManager from "@/component/Web3ReactManager";
import { NetworkContextName } from "@/constants";
import getLibrary from "@/utils/getLibrary";
const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);
export default function App(props: any) {
  return (
    <>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3ProviderNetwork getLibrary={getLibrary}>
          <Web3ReactManager>{props.children}</Web3ReactManager>
        </Web3ProviderNetwork>
      </Web3ReactProvider>
    </>
  );
}
