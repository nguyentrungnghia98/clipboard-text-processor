import { parseJSON, useLocalStorageJson } from "@/use-local-storage-json";
import React, { useEffect, useRef, useState } from "react";
import { Autocomplete, Box, Button, Checkbox, TextField } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { useCommunityWatchlist } from "@/utils/use-community-watchlist";
import { WatchList } from "./pumpfun-watchlist";
import { writeCommunityWatchlist } from "@/utils/firebase-store";

interface Props {}

export const PumpfunCommunity: React.FC<Props> = () => {
  const { communityWatchlist, setCommunityWatchlist, tags } =
    useCommunityWatchlist();
  const [liking, setLiking] = useState<{
    [address: string]: boolean;
  }>({});
  const [disliking, setDisliking] = useState<{
    [address: string]: boolean;
  }>({});
  const [modified, setModified] = useState<{
    [address: string]: boolean;
  }>({});
  const [updating, setUpdating] = useState<{
    [address: string]: boolean;
  }>({});
  const [showComments, setShowComments] = useState<{
    [address: string]: boolean;
  }>({});
  const [newComments, setNewComments] = useState<{
    [address: string]: string;
  }>({});

  const updateData = async (data: WatchList) => {
    try {
      await writeCommunityWatchlist(data);
      setCommunityWatchlist(old => {
        const newVal = [...old];
        const findIndex = old.findIndex(item => item.address === data.address);
        if (findIndex > -1) {
          newVal[findIndex] = data;
        }
        return newVal;
      })
    } catch (error) {
      console.log('updateData error:', error);
    }
  }

  return (
    <>
      <div className="watchlist mb-2 space-y-8">
        {communityWatchlist.map((item, index) => {
          return (
            <div className="url-input" key={item.id}>
              {Boolean(index) && <div className="divider"></div>}
              <div className="flex-center">
                <div className="w-[70%]">
                      <TextField
                      label="Address"
                      className="small-input"
                      fullWidth
                      value={item.address}
                      />
                </div>
                <div className="w-[30%] ml-3">
                  <TextField
                    fullWidth
                    label="Name"
                    variant="outlined"
                    value={item.name}
                    className="small-input"
                    onChange={(e) => {
                      setModified(old => {
                        const newVal = {...old}; newVal[item.address] = true; return newVal;
                      });
                      setCommunityWatchlist((old) => {
                        const newValue = [...old];
                        newValue[index].name = e.target.value;
                        return newValue;
                      });
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <Autocomplete
                  className="w-[70%]"
                  multiple
                  options={tags}
                  getOptionLabel={(option) => option}
                  defaultValue={[]}
                  filterSelectedOptions
                  value={item.tags}
                  onChange={(_, value) => {
                    setModified(old => {
                      const newVal = {...old}; newVal[item.address] = true; return newVal;
                    });
                    setCommunityWatchlist((old) => {
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
                <div className="w-[30%] ml-3 space-x-4 flex">
                  <a
                    href={`https://pump.fun/profile/${item.address}`}
                    target="_blank"
                  >
                    Link pumpfun
                  </a>
                  {
                    modified[item.address] && <Button disabled={updating[item.address]} variant="contained" onClick={async () => {
                      setUpdating(old => {
                        const newVal = {...old}; newVal[item.address] = true; return newVal;
                      });
                      await updateData(item)
                      setModified(old => {
                        const newVal = {...old}; newVal[item.address] = false; return newVal;
                      });
                      setUpdating(old => {
                        const newVal = {...old}; newVal[item.address] = false; return newVal;
                      });
                    }}>Update</Button>
                  }
                </div>
              </div>
              <div className='flex justify-between mt-2'>
                  <div className='space-x-4'>
                  <Button variant="outlined" disabled={liking[item.address]} onClick={async () => {
                    setLiking(old => {
                      const newVal = {...old}; newVal[item.address] = true; return newVal;
                    });
                    await updateData({...item, like: (item.like || 0) + 1})
                    setLiking(old => {
                      const newVal = {...old}; newVal[item.address] = false; return newVal;
                    });
                  }}>{`${item.like || 0} Like`}</Button>

                  <Button variant="outlined" disabled={disliking[item.address]} onClick={async () => {
                    setDisliking(old => {
                      const newVal = {...old}; newVal[item.address] = true; return newVal;
                    });
                    await updateData({...item, dislike: (item.dislike || 0) + 1})
                    setDisliking(old => {
                      const newVal = {...old}; newVal[item.address] = false; return newVal;
                    });
                  }}>{`${item.dislike || 0} Dislike`}</Button>
                  </div>

                  <a onClick={() => {
                    setShowComments(old => {
                      const newVal = {...old}; newVal[item.address] = !newVal[item.address]; return newVal;
                    });
                  }}>
                    {`${showComments[item.address]? 'Hide': 'Show'} comments (${item.comments?.length || 0})`}
                  </a>
              </div>
              {
                showComments[item.address] && <div className='space-y-2 mt-2'>
                  {item.comments?.map((comment, index) => <div className='comment flex justify-between' key={`${comment}-${index}`}>
                    <div>{comment}</div>
                    <div className="w-[20px] text-center" onClick={async () => {
                      const isConfirm = confirm("Confirm delete comment")
                      if (isConfirm) {
                        await updateData({...item, comments: item.comments?.filter((_, i) => i !== index)});
                      }
                    }}>X</div>
                  </div>)}
                </div>
              }
              <div className='w-full mt-3 flex items-center'>
                    <TextField
                      fullWidth
                      label="Comment"
                      className="small-input"
                      value={newComments[item.address]}
                      onChange={e => setNewComments(old => {
                        const newVal = {...old}; newVal[item.address] = e.target.value; return newVal;
                      })}
                    />
                    <div className='ml-2'>
                      <Button variant="contained" disabled={updating[item.address] || !newComments[item.address]} onClick={async () => {
                        setUpdating(old => {
                          const newVal = {...old}; newVal[item.address] = true; return newVal;
                        });
                        await updateData({...item, comments: (item.comments || []).concat(newComments[item.address])});
                        setNewComments(old => {
                          const newVal = {...old}; newVal[item.address] = ''; return newVal;
                        })
                        setUpdating(old => {
                          const newVal = {...old}; newVal[item.address] = false; return newVal;
                        });
                      }}>Add</Button>
                    </div>
                  </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
