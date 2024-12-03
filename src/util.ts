import { PublicKey } from "@solana/web3.js";

export function isValidAddress(address: string) {
  try {
    new PublicKey(address);
    return true;
  } catch(_) {
    return false;
  }
}