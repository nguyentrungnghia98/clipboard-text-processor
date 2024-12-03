import { parseJSON } from "@/use-local-storage-json";
import React, { useEffect, useState } from "react";
import { CreatedCoinInfo } from "@/utils/use-pumpfun-created-coin";
import moment from "moment";
import { Box, Modal } from "@mui/material";

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
  address: string;
}

function formatNumber(num: number) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num;
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '80vh',
  overflowY: "auto"
};

export const PumpfunWalletDetail: React.FC<Props> = ({
  open,
  setOpen,
  address,
}) => {
  const [tokens, setTokens] = useState<CreatedCoinInfo[]>([]);

  useEffect(() => {
    setTokens(
      parseJSON(localStorage.getItem(`pumpfun-new-token-${address}`)) || []
    );
  }, [address]);

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
      <div className="pumpfun-wallet-detail">
        <div className="mb-4"><b>{address}</b></div>
        <div className='space-y-6'>
        {tokens.map((token) => (
          <div className="token-detail flex" key={token.mint}>
            <div className="w-32 min-w-32">
              <img src={token.image_uri} alt="img" />
            </div>
            <div className="ml-3">
              <div className='flex'>
                <a className="mr-1" href={`https://pump.fun/${token.mint}`}  target="_blank">{token.name}</a>
                <div style={{color: "#0c78ff"}}>- {moment(token.created_timestamp).fromNow()}</div>
              </div>
              <div style={{color: "#86efac"}}>market cap: ${formatNumber(token.usd_market_cap)}</div>
              <div className="">{token.description}</div>
            </div>
          </div>
        ))}
        </div>
      </div>
      </Box>
    </Modal>
  );
};
