const navLang = navigator.language;
export function openUrl(bridgeChain, chainID, params, type) {
  let url = "";
  if (bridgeChain[chainID]) {
    const useObj =
      navLang === "zh-CN"
        ? bridgeChain[chainID].explorer_cn
        : bridgeChain[chainID].explorer;
    if (type === "tx") {
      url = useObj.tx + params;
    } else if (type === "address") {
      url = useObj.address + params;
    }
    window.open(url);
  }
  // console.log(url)
}
