import { useLocalStorage } from "@/use-local-storage";
import { Tab, Tabs, TextField } from "@mui/material";
import React, { useState } from "react";
import { PumpfunWatchlist } from "./pumpfun-watchlist";
import { PumpfunCommunity } from "./pumpfun-community";

interface Props {}
export const Pumpfun: React.FC<Props> = () => {
  const [tab, setTab] = useState<"watchlist" | "community">("watchlist");

  return (
    <>
      <div className="flex justify-end mt-2 mb-2">
        <Tabs
          className="mb-6 "
          value={tab}
          onChange={(e, value) => setTab(value)}
        >
          <Tab label="Watch list" value="watchlist" />
          <Tab label="Community" value="community" />
        </Tabs>
      </div>
      <div className={tab === "watchlist"? "": "d-none"}>
          <PumpfunWatchlist />
        </div>
        <div className={tab === "community"? "": "d-none"}>
          <PumpfunCommunity />
        </div>
    </>
  );
};
