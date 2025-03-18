import { memo, useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useLocalStorageJson } from "../use-local-storage-json";
import { useLocalStorage } from "../use-local-storage";

interface Props {}

const filters = [
  { label: "None", value: "None" },
  { value: "evm", label: "EVM wallet" },
  { value: "solana", label: "Solana wallet" },
];
export const ClipboardText: React.FC<Props> = memo(() => {
  const [openUrls, setOpenUrls] = useLocalStorageJson<
    {
      id: any;
      shortcut: string;
      urls: {
        id: any;
        value: string;
        isSelected: boolean;
      }[];
      filterText: string;
    }[]
  >("open-urls", [
    {
      id: Date.now() - 10,
      shortcut: "Alt+1",
      urls: [
        { 
          id: Date.now(),
          value: "https://x.com/search?q={copiedText}&src=typed_query",
          isSelected: true,
        },
        {
          id: Date.now() + 10,
          value: "https://neo.bullx.io/terminal?chainId=1399811149&address={copiedText}",
          isSelected: true,
        },
      ],
      filterText: "solana",
    },
    {
      id: Date.now() - 5,
      shortcut: "Alt+2",
      urls: [
        { 
          id: Date.now(),
          value: "https://x.com/search?q={copiedText}&src=typed_query",
          isSelected: true,
        },
        {
          id: Date.now() + 10,
          value: "https://mevx.io/bsc/{copiedText}",
          isSelected: true,
        },
      ],
      filterText: "evm",
    },
    {
      id: Date.now(),
      shortcut: "Alt+3",
      urls: [
        { 
          id: Date.now(),
          value: "https://x.com/search?q={copiedText}&src=typed_query",
          isSelected: true,
        },
        {
          id: Date.now() + 10,
          value: "https://mevx.io/base/{copiedText}",
          isSelected: true,
        },
      ],
      filterText: "evm",
    },
  ]);
  const [isRunning, setIsRunning] = useLocalStorage(
    "clipboard-isRunning",
    true,
    false,
    true
  );
  const [isModify, setIsModify] = useState(false);

  useEffect(() => {
    if (isRunning) {
      console.log("registerShortcut");
      (window as any).electronAPI.registerShortcut(openUrls.map(item => ({
        shortcut: item.shortcut,
        urls: item.urls
          .filter((item) => item.isSelected && Boolean(item.value))
          .map((item) => item.value),
        filterText: item.filterText,
      })));
    } else {
      console.log("unregisterAllShortcut");
      (window as any).electronAPI.unregisterAllShortcut();
    }
  }, [isRunning]);

  const onStart = () => {
    setIsRunning((old) => {
      if (old) {
        // pause
      } else {
        // start
        setIsModify(false);
      }
      return !old;
    });
  };

  const handleChange = (index: number, key: string, value: any) => {
    setOpenUrls((old) => {
      const newValue: any = [...old];
      newValue[index][key] = value;
      return newValue;
    });
  };

  return (
    <>
      <div className='space-y-4'>
      {openUrls.map((item, index) => (
        <div key={item.id} className="inputs border-base round-lg flex">
          <div className="w-full">
          <div className="w-full flex items-center space-x-4">
            <div>
              <div className="text-title mb-2">Shortcut</div>
              <TextField
                fullWidth
                variant="outlined"
                value={item.shortcut}
                onChange={(e) => {
                  setIsModify(true);
                  handleChange(index, 'shortcut', e.target.value);
                }}
              />
            </div>
            <div>
              <div className="text-title mb-2">Filter text</div>
              <Select
                className="min-w-[100px]"
                value={item.filterText}
                label="Filter"
                onChange={(e) => {
                  setIsModify(true);
                  handleChange(index, 'filterText', e.target.value);
                }}
              >
                {filters.map((item) => (
                  <MenuItem key={item.label} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>

          <div className="box mb-2 mt-2">
            {item.urls.map((url, index2) => (
              <div
                className="url-input flex-center"
                key={url.id}
              >
                <div className="mr-4">
                  <Checkbox
                    checked={url.isSelected}
                    onChange={(e) => {
                      setIsModify(true);
                      setOpenUrls((old) => {
                        const newValue = [...old];
                        newValue[index].urls = [...newValue[index].urls];
                        newValue[index].urls[index2].isSelected = e.target.checked;
                        return newValue;
                      });
                    }}
                  />
                </div>
                <TextField
                  fullWidth
                  label="Url"
                  variant="outlined"
                  value={url.value}
                  onChange={(e) => {
                    setIsModify(true);
                    setOpenUrls((old) => {
                      const newValue = [...old];
                      newValue[index].urls = [...newValue[index].urls];
                      newValue[index].urls[index2].value = e.target.value;
                      return newValue;
                    });
                  }}
                />
                <Button
                  variant="text"
                  className="ml-4"
                  onClick={() => {
                    setIsModify(true);
                    setOpenUrls((old) => {
                      const newValue = [...old];
                      newValue[index].urls = [...newValue[index].urls];
                      newValue[index].urls.splice(index2, 1);
                      return newValue;
                    });
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          </div>
          <div className="flex flex-col min-w-[140px] space-y-2 ml-4 pl-4 justify-center" style={{borderLeft: '1px solid #e1e1e1'}}>
              <Button
                variant="outlined"
                onClick={() => {
                  setIsModify(true);
                  setOpenUrls((old) => {
                    const newValue = [...old];
                    newValue.splice(index);
                    return newValue;
                  });
                }}
              >
                Remove
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setIsModify(true);
                  setOpenUrls((old) => {
                    const newValue = [...old];
                    newValue[index].urls = [...newValue[index].urls];
                    newValue[index].urls.push({
                      isSelected: true,
                      value: "",
                      id: Date.now()
                    });
                    return newValue;
                  });
                }}
              >
                Add url
              </Button>
          </div>
        </div>
      ))}
      </div>

      {isModify && (
        <div className="flex-center-center mb-2">
          You have edited, please restart to update the changes.
        </div>
      )}

      <div className="flex-center-center pb-4 mt-4 space-x-4">
        <Button
          variant={"outlined"}
          onClick={() => setOpenUrls(old => old.concat({
            id: Date.now(),
            shortcut: "CommandOrControl+Shift+C",
            urls: [
              {
                id: Date.now(),
                value: "",
                isSelected: true,
              },
            ],
            filterText: "None",
          }))}
        >
          Add
        </Button>
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
