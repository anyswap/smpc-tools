import React, { useEffect } from "react";
import { useSignEnode, useReqSmpcAddress } from "@/hooks/useSigns";

interface Iprops {
  Gid: string;
  ThresHold: string;
  Sgid: string;
}

const Index = (props: Iprops) => {
  const { Gid, ThresHold, Sgid } = props;
  const { execute } = useReqSmpcAddress(Gid, ThresHold, Sgid);
  console.info(444, Gid, ThresHold, Sgid);
  console.info("444execute", execute);
  useEffect(() => {
    execute &&
      execute().then((res) => {
        console.info("ressss9999", res);
      });
  }, []);
  return <></>;
};

export default Index;
