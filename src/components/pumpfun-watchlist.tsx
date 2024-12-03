import { parseJSON, useLocalStorageJson } from "@/use-local-storage-json";
import React, { useEffect, useRef, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Modal,
  Select,
  TextField,
} from "@mui/material";
import { isValidAddress } from "@/util";
import { v4 as uuidv4 } from "uuid";
import { useLocalStorage } from "@/use-local-storage";
import { toast } from "react-toastify";
import {
  CreatedCoinInfo,
  getPumpfunCreatedCoin,
} from "@/utils/use-pumpfun-created-coin";
import { TelegramHelpers } from "@/telegram";
import { PumpfunWalletDetail } from "./pumpfun-wallet-detail";
import { writeCommunityWatchlists } from "@/utils/firebase-store";
import { useCommunityWatchlist } from "@/utils/use-community-watchlist";

export interface WatchList {
  id: string;
  address: string;
  name: string;
  tags: string[];
  isSelected: boolean;
  comments?: string[];
  like?: number;
  dislike?: number;
}

interface Props {}

const intervals = [
  // { label: "10s", value: 10 * 1000 },
  { label: "30s", value: 30 * 1000 },
  { label: "1 minutes", value: 1 * 60 * 1000 },
  { label: "3 minutes", value: 3 * 60 * 1000 },
  { label: "5 minutes", value: 5 * 60 * 1000 },
  { label: "10 minutes", value: 10 * 60 * 1000 },
  { label: "30 minutes", value: 30 * 60 * 1000 },
  { label: "1 hour", value: 60 * 60 * 1000 },
];

export const PumpfunWatchlist: React.FC<Props> = () => {
  const { communityWatchlist, tags } = useCommunityWatchlist();
  const [openModal, setOpenModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [botApi, setBotApi] = useLocalStorage("botApi", "");
  const [chatId, setChatId] = useLocalStorage("chatId", "");
  const [isModify, setIsModify] = useState(false);
  const [isRunning, setIsRunning] = useLocalStorage(
    "pumpfun-watchlist-isRunning",
    false,
    false,
    true
  );
  const [isLoading, setIsLoading] = useState(false);
  const [onlyNotifyNewTokenFromNow, setOnlyNotifyNewTokenFromNow] =
    useLocalStorage("onlyNotifyNewTokenFromNow", false, false, true);
  const [watchlist, setWatchlist] = useLocalStorageJson<WatchList[]>(
    "pumpfun_watchlist_3",
    [
      {
        id: uuidv4(),
        address: "CHGELb1Vh344DvHZ2qok68ec9Lva39kHbtQPMxqA1uXK",
        name: "herdev",
        tags: ["100k -> 1M"],
        isSelected: true,
      },
      {
        id: uuidv4(),
        address: "7CwbhCXbqWNmpHnYscZ4JVFCGerVDsW2GWSFZ8qNNoLG",
        name: "test",
        tags: [],
        isSelected: true,
      },
    ]
  );
  const [checkInterval, setCheckInterval] = useLocalStorage(
    "checkWatchlistInterval",
    60 * 1000,
    true
  );
  const interval = useRef<NodeJS.Timer>();

  const handleRun = async () => {
    if (isRunning) {
      if (!botApi) {
        toast.error("Please input telegram bot api");
        return;
      }
      if (!chatId) {
        toast.error("Please input telegram chat id");
        return;
      }
      const validWatchlist = watchlist.filter((item) => {
        return Boolean(item.address.trim()) && item.isSelected;
      });

      const addresses = validWatchlist.map((item) => item.address.trim());
      if (!addresses) {
        toast.error("Please input address");
        return;
      }

      setIsLoading(true);
      console.log('validWatchlist', validWatchlist);
      await writeCommunityWatchlists(watchlist.filter((item) => {
        return Boolean(item.address.trim())
      }));
      if (onlyNotifyNewTokenFromNow) {
        addresses.forEach((address) => {
          localStorage.removeItem(`pumpfun-new-token-${address}`);
        });
        for (const address of addresses) {
          const current = await getPumpfunCreatedCoin(address);
          if (current.length) {
            localStorage.setItem(
              `pumpfun-new-token-${address}`,
              JSON.stringify(current)
            );
          }
        }
      } else {
        for (const address of addresses) {
          if (!localStorage.getItem(`pumpfun-new-token-${address}`)) {
            const current = await getPumpfunCreatedCoin(address);
            if (current.length) {
              localStorage.setItem(
                `pumpfun-new-token-${address}`,
                JSON.stringify(current)
              );
            }
          }
        }
      }
      console.log("start interval");
      if (interval.current) clearInterval(interval.current);
      const intervalVal = setInterval(async () => {
        if (intervalVal !== interval.current) {
          console.log('skip');
          clearInterval(intervalVal);
          return;
        }

        for (let index = 0; index < addresses.length; index++) {
          const address = addresses[index];
          const watchlistInfo = validWatchlist[index];
          const current = await getPumpfunCreatedCoin(address);
          const old: CreatedCoinInfo[] | undefined = parseJSON(
            localStorage.getItem(`pumpfun-new-token-${address}`)
          );
          console.log("old", old, current);

          const newTokens = current.filter(
            (token) => !old?.map((item) => item.mint).includes(token.mint)
          );
          if (newTokens.length) {
            localStorage.setItem(
              `pumpfun-new-token-${address}`,
              JSON.stringify((old || []).concat(newTokens))
            );

            for (let token of newTokens) {
              await TelegramHelpers.sendMessage({
                chatId,
                botToken: botApi,
                text: `<b>🔥 NEW PUMP FUN Token 🔥</b>\n\n<a href='https://pump.fun/${
                  token.mint
                }'>${token.name}</a>\n\n<b>🔗 MINT CA</b>\n<code>${
                  token.mint
                }</code>\n\n<b>🎨 CREATOR</b>\n├ 👤 <b>Creator</b> : <a href='https://pump.fun/profile/${
                  watchlistInfo.address
                }'>${
                  watchlistInfo.name || watchlistInfo.address.slice(0, 6)
                }</a>\n└ 💸 Tags: ${watchlistInfo.tags.join(
                  ", "
                )}\n\n<b>🔗 SOCIALS</b>\n├ 🌐 <b>Website</b> : ${
                  token.website
                    ? `<a href='${token.website}'>${token.website}</a>`
                    : "Not Available"
                }\n├ 🐦 <b>Twitter</b> : ${
                  token.twitter
                    ? `<a href='${token.twitter}'>${token.twitter}</a>`
                    : "Not Available"
                }\n├ 📱 <b>Telegram</b> : ${
                  token.telegram
                    ? `<a href='${token.telegram}'>${token.telegram}</a>`
                    : "Not Available"
                }\n└ 💊 <b>Pump Fun</b> : <a href='https://pump.fun/${
                  token.mint
                }'>${
                  token.name
                }</a>\n\n<a href='https://photon-sol.tinyastro.io/en/r/@lamtam1998/${
                  token.mint
                }'>Photon</a> | <a href='https://dexscreener.com/solana/${
                  token.mint
                }'>Dexscreener</a> | <a href='https://mevx.io/solana/${
                  token.mint
                }?ref=MiFPuUCvHwlg'>Dexscreener</a>`,
              });
            }
          }
        }
      }, checkInterval);

      interval.current = intervalVal;
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (interval.current) clearInterval(interval.current);
    handleRun();
  }, [isRunning]);

  const onStart = async () => {
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

  return (
    <>
      <div className="flex justify-between space-x-4 mb-4">
        <div className="check-interval min-w-[120px]">
          <div>Check interval:</div>
          <Select
            className="mt-[6px] min-w-[100px]"
            value={checkInterval}
            label="Interval"
            onChange={(e) => {
              setIsModify(true);
              setCheckInterval(Number(e.target.value));
            }}
          >
            {intervals.map((item) => (
              <MenuItem key={item.label} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </div>
        <div className="w-full">
          <div className="text-title mb-2">Telegram bot api:</div>
          <TextField
            className="small-input"
            fullWidth
            variant="outlined"
            value={botApi}
            onChange={(e) => {
              setIsModify(true);
              setBotApi(e.target.value);
            }}
          />
        </div>
        <div className="w-full">
          <div className="text-title mb-2">Chat id:</div>
          <TextField
            className="small-input"
            fullWidth
            variant="outlined"
            value={chatId}
            onChange={(e) => {
              setIsModify(true);
              setChatId(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="watchlist box mb-2 space-y-10 pt-4">
        {watchlist.map((item, index) => {
          return (
            <div className="url-input" key={item.id}>
              <div className="flex-center">
                <div className="w-[60px]">
                  <Checkbox
                    checked={item.isSelected}
                    onChange={(e) => {
                      setIsModify(true);
                      setWatchlist((old) => {
                        const newValue = [...old];
                        newValue[index].isSelected = e.target.checked;
                        return newValue;
                      });
                    }}
                  />
                </div>
                <div className="w-[60%]">
                  <Autocomplete
                    className="small-input"
                    freeSolo
                    value={item.address}
                    onChange={(e, value) => {
                      setIsModify(true);
                      setWatchlist((old) => {
                        const newValue = [...old];
                        if (typeof value === "string") {
                          newValue[index].address = value;
                        } else if (!value) {
                          newValue[index].address = '';
                        } else {
                          newValue[index].address = value.value;
                          newValue[index].name = value.title;
                        }

                        return newValue;
                      });
                    }}
                    options={communityWatchlist.map((option) => ({
                      title: option.name,
                      value: option.address,
                    })).filter(el => el.value !== item.address)}
                    getOptionLabel={(option) => {
                      return typeof option === "string" ? option : option.value;
                    }}
                    renderOption={(props, value) => {
                      const { key, ...optionProps } = props;
                      return (
                        <Box
                          key={key}
                          sx={{
                            borderRadius: "8px",
                            padding: "8px",
                          }}
                          component="li"
                          {...optionProps}
                        >
                          <div className="">
                            <div className="">
                              <b>{value.title}</b>
                            </div>
                            <div className="">{value.value}</div>
                          </div>
                        </Box>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={!item.address.trim()}
                        helperText={
                          !item.address.trim() ? "Invalid address" : ""
                        }
                        label="Address"
                      />
                    )}
                  />
                </div>
                <div className="w-[20%] ml-3">
                  <TextField
                    fullWidth
                    label="Name"
                    variant="outlined"
                    value={item.name}
                    className="small-input"
                    onChange={(e) => {
                      setIsModify(true);
                      setWatchlist((old) => {
                        const newValue = [...old];
                        newValue[index].name = e.target.value;
                        return newValue;
                      });
                    }}
                  />
                </div>
                <Button
                  variant="text"
                  className="ml-4 w-[70x]"
                  onClick={() => {
                    setIsModify(true);
                    setWatchlist((old) => {
                      const newValue = [...old];
                      newValue.splice(index, 1);
                      return newValue;
                    });
                  }}
                >
                  Remove
                </Button>
              </div>
              <div className="flex items-center mt-2">
                <div className="w-[60px]"></div>
                <Autocomplete
                  className="w-[60%]"
                  multiple
                  options={tags}
                  getOptionLabel={(option) => option}
                  defaultValue={[]}
                  filterSelectedOptions
                  value={item.tags}
                  onChange={(_, value) => {
                    setIsModify(true);
                    setWatchlist((old) => {
                      const newValue = [...old];
                      newValue[index].tags = value;
                      return newValue;
                    });
                  }}
                  freeSolo
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Tags" />
                  )}
                />
                <div className="w-[20%] ml-3 space-x-4 flex">
                  <a
                    onClick={() => {
                      setOpenModal(true);
                      setSelectedAddress(item.address);
                    }}
                  >
                    View detail
                  </a>
                  <a
                    href={`https://pump.fun/profile/${item.address}`}
                    target="_blank"
                  >
                    Link pumpfun
                  </a>
                </div>
                <div className="w-[70px]"></div>
              </div>
            </div>
          );
        })}
        <div className="w-full flex-end mt-2">
          <Button
            variant="contained"
            onClick={() => {
              setIsModify(true);
              setWatchlist((old) =>
                old.concat({
                  id: uuidv4(),
                  isSelected: true,
                  address: "",
                  name: "",
                  tags: [],
                })
              );
            }}
          >
            Add
          </Button>
        </div>
      </div>

      {/* <div className="flex justify-center">
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={onlyNotifyNewTokenFromNow}
                onChange={(e) => {
                  setIsModify(true);
                  setOnlyNotifyNewTokenFromNow(e.target.checked);
                }}
              />
            }
            label="Only notify new token from now"
          />
        </FormGroup>
      </div> */}

      {isModify && (
        <div className="flex-center-center mb-2">
          You have edited, please restart to update the changes.
        </div>
      )}

      <div className="flex-center-center pb-4">
        <Button
          variant={isRunning ? "outlined" : "contained"}
          onClick={onStart}
          disabled={isLoading}
        >
          {isRunning ? "Stop" : "Start"}
        </Button>
      </div>

      <PumpfunWalletDetail
        open={openModal}
        setOpen={setOpenModal}
        address={selectedAddress}
      />
    </>
  );
};
