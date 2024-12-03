import { memo, useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField,
} from "@mui/material";
import { useLocalStorageJson } from "../use-local-storage-json";
import { useLocalStorage } from "../use-local-storage";

interface Props {

}
export const ClipboardText: React.FC<Props> = memo(() => {
  const [shortcut, setShortcut] = useLocalStorage("shortcut", "CommandOrControl+Shift+C");
  const [urls, setUrls] = useLocalStorageJson<{
    value: string;
    isSelected: boolean;
  }[]>('urls_2', [
    {
      value: "https://x.com/search?q={copiedText}&src=typed_query",
      isSelected: true
    },
    {
      value: "https://pump.fun/coin/{copiedText}",
      isSelected: true
    },
    {
      value: "https://photon-sol.tinyastro.io/en/lp/{copiedText}",
      isSelected: true
    },
  ]);
  const [isFilterSolAddress, setIsFilterSolAddress] = useLocalStorage("isFilterSolAddress", true, false, true);
  const [isRunning, setIsRunning] = useLocalStorage('clipboard-isRunning',true, false, true);
  const [isModify, setIsModify] = useState(false);

  useEffect(() => {
    if (isRunning) {
      console.log('registerShortcut');
      (window as any).electronAPI.registerShortcut({
        shortcut,
        urls: urls.filter(item => item.isSelected && Boolean(item.value)).map(item => item.value),
        isFilterSolAddress,
      });
    } else {
      console.log('unregisterAllShortcut');
      (window as any).electronAPI.unregisterAllShortcut();
    }
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
    <>
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
            <div className="url-input flex-center" key={`${url.value}-${Date.now()}-${index}`}>
              <div className="mr-4">
                <Checkbox
                  checked={url.isSelected}
                  onChange={(e) => {setIsModify(true); setUrls(old => {
                    const newValue = [...old];
                    newValue[index].isSelected = e.target.checked;
                    return newValue;
                  })}}
                />
              </div>
              <TextField
                fullWidth
                label="Url"
                variant="outlined"
                value={url.value}
                onChange={(e) => {
                  setIsModify(true);
                  setUrls((old) => {
                    const newValue = [...old];
                    newValue[index].value = e.target.value;
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
            onClick={() => {setIsModify(true); setUrls((old) => old.concat({
              isSelected: true,
              value: ""
            }))}}
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
    </>
  );
});
