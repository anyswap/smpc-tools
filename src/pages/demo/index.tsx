import React, { useCallback, useMemo, useReducer } from "react";

import web3 from "@/assets/js/web3";
import { Button } from "antd";
import {
  useSignEnode,
  useCreateGroup,
  useReqSmpcAddress,
} from "@/hooks/useSigns";
import { useActiveWeb3React } from "@/hooks";

const USER_ONE = "userone";
const USER_TWO = "usertwo";

const ThresHold = "2/2";

const initConfig: any = {
  [USER_ONE]: {
    rpc: "http://81.69.176.223:5916",
  },
  [USER_TWO]: {
    rpc: "http://93.104.213.123:5916",
  },
};

function getStateReducer() {
  return {
    ...initConfig,
  };
}
function setStateReducer(state: any, action: any) {
  switch (action.type) {
    case "INCREAT_ENODE": {
      const { enode, user, signEnode } = action;
      // console.log(state)
      // console.log(action)
      // console.log(enode)
      // console.log(user)
      return {
        ...state,
        [user]: {
          ...(state[user] ? state[user] : {}),
          enode: enode ? enode : state?.[user]?.enode,
          signEnode: signEnode ? signEnode : state?.[user]?.signEnode,
        },
      };
    }
    case "INCREAT_GID": {
      const { gid } = action;
      // console.log(state)
      // console.log(action)
      // console.log(enode)
      // console.log(user)
      return {
        ...state,
        gid,
      };
    }
  }
}

function SignEnoode({
  title,
  user,
  enode,
  onGetEnode,
  onGetSignEnode,
}: {
  title: any;
  user: any;
  enode: any;
  onGetEnode: (v: any) => void;
  onGetSignEnode: (v: any) => void;
}) {
  const { account } = useActiveWeb3React();
  const useInfo = useMemo(() => {
    if (initConfig?.[user]) {
      return initConfig?.[user];
    }
    return undefined;
  }, [user, initConfig]);
  const { execute } = useSignEnode(enode);
  const getEnode = useCallback(async () => {
    // console.log(user)
    // console.log(useInfo)
    // console.log(smpcState)
    if (useInfo) {
      web3.setProvider(useInfo.rpc);
      const res = await web3.smpc.getEnode();
      console.log(res.Data.Enode);
      onGetEnode(res.Data.Enode);
    }
  }, [useInfo]);
  const validEnode = useCallback(() => {
    if (execute) {
      execute().then((res) => {
        onGetSignEnode(enode + res);
      });
    }
  }, [execute, enode]);
  return (
    <>
      <h3>{title}</h3>
      <Button
        onClick={() => {
          getEnode();
        }}
        disabled={Boolean(enode)}
      >
        Get Enode
      </Button>
      <Button
        onClick={() => {
          validEnode();
        }}
        disabled={!Boolean(enode)}
      >
        Valid Enode
      </Button>
    </>
  );
}

function CreateAccount({
  user,
  enodeOne,
  enodeTwo,
  sigsOne,
  sigsTwo,
  Gid,
  onGetGID,
}: {
  user: any;
  enodeOne: any;
  enodeTwo: any;
  sigsOne: any;
  sigsTwo: any;
  Gid: any;
  onGetGID: (v: any) => void;
}) {
  const { account } = useActiveWeb3React();
  const useInfo = useMemo(() => {
    if (initConfig?.[user]) {
      return initConfig?.[user];
    }
    return undefined;
  }, [user, initConfig]);

  const enodeArr = useMemo(() => {
    const arr = [];
    if (enodeOne) {
      arr.push(enodeOne);
    }
    if (enodeTwo) {
      arr.push(enodeTwo);
    }
    return arr;
  }, [enodeOne, enodeTwo]);

  const { execute } = useCreateGroup(useInfo?.rpc, ThresHold, enodeArr);

  const Sigs = useMemo(() => {
    const arr = [];
    if (sigsOne) {
      arr.push(sigsOne);
    }
    if (sigsTwo) {
      arr.push(sigsTwo);
    }
    return arr;
  }, [sigsOne, sigsTwo]);
  const { execute: reqSmpcAddr } = useReqSmpcAddress(
    useInfo?.rpc,
    Gid,
    ThresHold,
    Sigs.join("|")
  );

  const createGroup = useCallback(() => {
    console.log(enodeArr);
    if (execute) {
      execute().then((res) => {
        console.log(res);
        onGetGID(res.info.Gid);
      });
    }
  }, [execute, enodeArr]);

  const createAccount = useCallback(() => {
    console.log(Sigs);
    if (reqSmpcAddr) {
      reqSmpcAddr().then((res) => {
        console.log(res);
        // onGetGID(res.info.Gid)
      });
    }
  }, [reqSmpcAddr, Sigs]);
  return (
    <>
      <Button
        onClick={() => {
          createGroup();
        }}
        disabled={Boolean(Gid)}
      >
        Create Group
      </Button>
      <Button
        onClick={() => {
          createAccount();
        }}
        disabled={!Boolean(Gid)}
      >
        Create Account
      </Button>
    </>
  );
}

function Approve() {
  return <></>;
}

export default function Demo() {
  const [smpcState, dispatchSmpcState] = useReducer(
    setStateReducer,
    {
      ...initConfig,
    },
    getStateReducer
  );
  console.log(smpcState);
  // const {} = smpcState
  return (
    <>
      <div className="container get-enode">
        <SignEnoode
          title="User One"
          user={USER_ONE}
          enode={smpcState?.[USER_ONE]?.enode}
          onGetEnode={(enode) => {
            dispatchSmpcState({
              type: "INCREAT_ENODE",
              user: USER_ONE,
              enode,
            });
          }}
          onGetSignEnode={(signEnode) => {
            dispatchSmpcState({
              type: "INCREAT_ENODE",
              user: USER_ONE,
              signEnode,
            });
          }}
        />
        <SignEnoode
          title="User Two"
          user={USER_TWO}
          enode={smpcState?.[USER_TWO]?.enode}
          onGetEnode={(enode) => {
            dispatchSmpcState({
              type: "INCREAT_ENODE",
              user: USER_TWO,
              enode,
            });
          }}
          onGetSignEnode={(signEnode) => {
            dispatchSmpcState({
              type: "INCREAT_ENODE",
              user: USER_TWO,
              signEnode,
            });
          }}
        />
        <CreateAccount
          user={USER_ONE}
          enodeOne={smpcState?.[USER_ONE]?.enode}
          enodeTwo={smpcState?.[USER_TWO]?.enode}
          sigsOne={smpcState?.[USER_ONE]?.signEnode}
          sigsTwo={smpcState?.[USER_TWO]?.signEnode}
          Gid={smpcState?.gid}
          onGetGID={(gid) => {
            dispatchSmpcState({
              type: "INCREAT_GID",
              gid: gid,
            });
          }}
        />
        <Approve />
      </div>
    </>
  );
}
