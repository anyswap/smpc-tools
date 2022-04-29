import { useActiveWeb3React } from "@/hooks";
import { useMemo } from "react";

import { ethers } from "_ethers@5.6.4@ethers";
export enum WrapType {
  NOT_APPLICABLE,
  WRAP,
  UNWRAP,
  NOCONNECT,
}

const NOCONNECT = { wrapType: WrapType.NOCONNECT };

export function eNodeCut(enode: any) {
  const obj = {
    key: "",
    ip: "",
    enode: "",
  };
  if (!enode || enode.indexOf("enode://") === -1 || enode.indexOf("@") === -1)
    return obj;
  const enodeObj: any = enode.match(/enode:\/\/(\S*)@/);
  const ip = enode.match(/@(\S*)/)[1];
  // console.log(enodeObj)
  // console.log(ip)
  return {
    key: enodeObj[1],
    ip: ip,
    enode: enodeObj.input,
  };
}

export function useSign(parsms: any): {
  execute?: undefined | (() => Promise<void>);
  wrapType?: WrapType;
} {
  const { account, library } = useActiveWeb3React();
  return useMemo(() => {
    if (!library) return NOCONNECT;
    return {
      wrapType: WrapType.WRAP,
      execute: async () => {
        library
          .send("eth_sign", parsms)
          .then((result: any) => {
            return result;
          })
          .catch((error: any) => {
            console.error("Could not sign", error);
          });
      },
    };
  }, [library]);
}

export function useSignEnode(enode: string | undefined): {
  execute?: undefined | (() => Promise<any>);
  wrapType?: WrapType;
} {
  const { account, library } = useActiveWeb3React();
  return useMemo(() => {
    if (!enode || !library) return {};
    return {
      wrapType: WrapType.WRAP,
      execute: async () => {
        let eNodeKey = eNodeCut(enode).key;
        const provider = new ethers.providers.Web3Provider(library.provider);
        const signer = provider.getSigner();
        const result = await signer.signMessage(eNodeKey);
        const rsv =
          result.indexOf("0x") === 0 ? result.replace("0x", "") : result;
        let v = parseInt("0x" + rsv.substr(128));
        const rsvFormat =
          "0x" +
          rsv.substr(0, 64) +
          rsv.substr(64, 64) +
          (Number(v) - 27 === 0 ? "00" : "01");
        return rsvFormat;
      },
    };
  }, [enode, library, account]);
}
