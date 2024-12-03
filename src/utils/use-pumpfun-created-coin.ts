import axios from "axios";
import { useEffect, useState } from "react";

export interface CreatedCoinInfo {
  mint: string
  name: string
  symbol: string
  description: string
  image_uri: string
  video_uri: string
  metadata_uri: string
  twitter: string
  telegram: string
  bonding_curve: string
  associated_bonding_curve: string
  creator: string
  created_timestamp: number
  raydium_pool: string
  complete: boolean
  virtual_sol_reserves: number
  virtual_token_reserves: number
  total_supply: number
  website: string
  show_name: boolean
  king_of_the_hill_timestamp: number
  market_cap: number
  reply_count: number
  last_reply: number
  nsfw: boolean
  market_id: string
  inverted: boolean
  is_currently_live: boolean
  username: any
  profile_image: any
  usd_market_cap: number
}

export async function getPumpfunCreatedCoin(address: string) {
  return await (window as any).electronAPI.getPumpfunCreatedCoin(address) as CreatedCoinInfo[];
  // try {
  //   // const res = await axios.get(`https://frontend-api.pump.fun/coins/user-created-coins/${address}?offset=0&limit=10&includeNsfw=false`, {
  //   //   headers: {
  //   //     'Access-Control-Allow-Origin': '*',
  //   //     'Content-Type': 'application/json',
  //   //   },
  //   //   withCredentials: true,
  //   // });
  //   // return res.data as CreatedCoinInfo[];
  //   const res = await fetch(`https://frontend-api.pump.fun/coins/user-created-coins/${address}?offset=0&limit=10&includeNsfw=false`, {
  //     mode: 'no-cors',
  //     headers: {
  //       'Access-Control-Allow-Origin': '*',
  //       'Content-Type': 'application/json',
  //     }
  //   });
  //   console.log('res', res);
  //   const text = await res.text();
  //   console.log('text', text);
  //   return JSON.parse(text) as CreatedCoinInfo[];
  // } catch (error) {
  //   console.log('getPumpfunCreatedCoin error:', error);
  //   return [];
  // }
}
export function usePumpfunCreatedCoin(address: string) {
  const [data, setData] = useState<CreatedCoinInfo[]>([])
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    setData(await getPumpfunCreatedCoin(address));
    setLoading(false);
  }

  useEffect(() => {
    fetch();
  }, [address])

  return {data, loading}
}