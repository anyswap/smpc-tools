import { getAddress } from "@ethersproject/address";

export const reducer = (state = {}, action: any) => {
  return { ...state, ...action };
};

export function isAddress(value: any): string | false {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}
