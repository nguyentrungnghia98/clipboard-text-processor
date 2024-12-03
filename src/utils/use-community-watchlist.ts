import { WatchList } from "@/components/pumpfun-watchlist";
import { useEffect, useMemo, useState } from "react";
import { getCommunityWatchlist } from "./firebase-store";

export const useCommunityWatchlist = () => {
  const [data, setData] = useState<WatchList[]>([])
  const [loading, setLoading] = useState(true);

  const tags = useMemo(() => {
    const result: string[] = [];
    data.forEach(item => {
      item.tags.forEach(tag => {
        if (!result.includes(tag)) result.push(tag)
      })
    })
    return result;
  }, [data])

  const fetch = async (isInit: boolean) => {
    console.log('fetch', isInit);
    if (isInit) setLoading(true);
    try {
      const list = await getCommunityWatchlist();
      setData(list);
    } catch (error) {
      console.log('getCommunityWatchlist error:', error);
      setData([]);
    }
    if (isInit) setLoading(false);
  }

  useEffect(() => {
    fetch(true);

    const interval = setInterval(() => {
      fetch(false);
    }, 3 * 60 * 1000);

    return () => {
      if (interval) clearInterval(interval);
    }
  }, [])

  return {communityWatchlist: data, setCommunityWatchlist: setData, tags, loading, fetch}
}