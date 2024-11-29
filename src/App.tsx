import { useEffect, useState } from "react";
import "./App.css";
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField,
} from "@mui/material";
import { useLocalStorageJson } from "./use-local-storage-json";
import { useLocalStorage } from "./use-local-storage";
// import { PublicKey } from "@solana/web3.js";

function App() {
  const [shortcut, setShortcut] = useLocalStorage("shortcut", "CommandOrControl+Shift+C");
  const [urls, setUrls] = useLocalStorageJson<string[]>('urls', [
    "https://x.com/search?q={copiedText}&src=typed_query",
    "https://pump.fun/coin/{copiedText}",
    "https://photon-sol.tinyastro.io/en/lp/{copiedText}",
  ]);
  const [isFilterSolAddress, setIsFilterSolAddress] = useLocalStorage("isFilterSolAddress", true, false, true);
  const [isRunning, setIsRunning] = useState(false);
  const [isModify, setIsModify] = useState(false);

  useEffect(() => {
    (window as any).electronAPI.registerShortcut({
      shortcut,
      urls,
      isFilterSolAddress,
    });
  }, [isRunning]);

  const onStart = () => {
    setIsRunning(old => {
      if (old) {
        // pause
      } else {
        // start
        setIsModify(false);

      }
      return !old;
    })
  };

  return (
    <div className="App container">
      <div className="donate">
        <b>Donate (SOL):</b>
        <span>A9U41fxcysG8KAE7sEvGpiRS1Udrkv84iuii7NiCFwzs</span>
      </div>

      <div className="inputs">
        <div className="w-full">
          <div className="text-title mb-2">Shortcut</div>
          <TextField
            fullWidth
            variant="outlined"
            value={shortcut}
            onChange={(e) => {setIsModify(true); setShortcut(e.target.value)}}
          />
        </div>

        <div className="mt-4  mb-2">Urls</div>
        <div className="box mb-2">
          {urls.map((url, index) => (
            <div className="url-input flex-center">
              <div className="mr-4">{index + 1}.</div>
              <TextField
                fullWidth
                label="Url"
                variant="outlined"
                value={url}
                onChange={(e) => {
                  setIsModify(true);
                  setUrls((old) => {
                    const newValue = [...old];
                    newValue[index] = e.target.value;
                    return newValue;
                  });
                }}
              />
              <Button variant="text" className="ml-4" onClick={() => {
                setIsModify(true);
                setUrls(old => {
                  const newValue = [...old];
                  newValue.splice(index, 1);
                  return newValue;
                })
              }}>
                Remove
              </Button>
            </div>
          ))}
        <div className="w-full flex-end">
          <Button
            variant="contained"
            onClick={() => {setIsModify(true); setUrls((old) => old.concat(""))}}
          >
            Add
          </Button>
        </div>
        </div>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={isFilterSolAddress}
                onChange={(e) => {setIsModify(true); setIsFilterSolAddress(e.target.checked)}}
              />
            }
            label="Is only filter by Solana address?"
          />
        </FormGroup>
      </div>

      {isModify && <div className="flex-center-center mb-2">
        You have edited, please restart to update the changes.
        </div>}

      <div className="flex-center-center pb-4">
        <Button
          variant={isRunning ? "outlined" : "contained"}
          onClick={onStart}
        >
          {isRunning ? "Stop" : "Start"}
        </Button>
      </div>
    </div>
  );
}

export default App;
