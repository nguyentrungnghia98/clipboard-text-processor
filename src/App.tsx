import { useEffect, useState } from "react";
import "./App.css";
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import { useLocalStorageJson } from "./use-local-storage-json";
import { useLocalStorage } from "./use-local-storage";
import { ClipboardText } from "./components/clipboard-text";
import { Pumpfun } from "./components/pumpfun";

function App() {
  const [tab, setTab] = useState<"pumpfun" | "clipboard">("pumpfun");

  return (
    <div className="App container">
      <div className="flex justify-between">
        <Tabs
          className="mb-6 text-bold ml-[-16px]"
          value={tab}
          onChange={(e, value) => setTab(value)}
        >
          <Tab label="Pumpfun Watch list" value="pumpfun" />
          <Tab label="Auto open  urls" value="clipboard" />
        </Tabs>
        <div className="mt-2">
          <b>Donate (SOL):</b>
          <span>A9U41fxcysG8KAE7sEvGpiRS1Udrkv84iuii7NiCFwzs</span>
        </div>
      </div>

      <div className={tab === "clipboard" ? "" : "d-none"}>
        <ClipboardText />
      </div>
      <div className={tab === "pumpfun" ? "" : "d-none"}>
        <Pumpfun />
      </div>
    </div>
  );
}

export default App;
