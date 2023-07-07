import Button from '@components/Button';
import React, { useState } from 'react';
import accountIcon from '@assets/icons/account.svg';
import copyIcon from '@assets/icons/copy.svg';
import shareIcon from '@assets/icons/share.svg';
import useClipboard from 'react-use-clipboard';
import ToolTip from '@components/Tooltip';
import AuthConnectModal from '@modules/AuthConnectModal';
import { disconnect } from '@store/wallet';

const SwitchConnectModal: React.FC<{ account: string | undefined | null; shortAccount: string }> = ({ account, shortAccount }) => {
  const [isCopied, setCopied] = useClipboard(account ?? '', { successDuration: 1000 });
  const [isShowConnect, setIsShowConnect] = useState(false);

  const changeConnect = () => {
    setIsShowConnect(true);
  };

  return (
    <>
      {!isShowConnect && (
        <div className="border-2 border-solid border-[#1e1e1e] rounded-[4px] p-[24px] mt-[18px]">
          <div className="font-bold font-[18px] mb-[24px]">Current connected</div>
          <div className="flex items-center mb-[16px]">
            <img src={accountIcon} alt="account" />
            <div className="font-[24px] font-bold ml-[8px]">{shortAccount}</div>
          </div>
          <div className="flex font-[18px] font-bold justify-center mb-[36px]">
            <ToolTip text="Copied success" visible={isCopied} trigger="click">
              <div className="flex items-center mr-[24px] cursor-pointer" onClick={setCopied}>
                <img src={copyIcon} alt="copy" className="mr-[4px]" />
                Copy Address
              </div>
            </ToolTip>
            <div className="flex items-center cursor-pointer">
              <img src={shareIcon} alt="share" className="mr-[4px]" />
              <a
                href={`${import.meta.env.VITE_ESpaceScanUrl}/address/${account}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1e1e1e] no-underline"
              >
                View on Conflux Scan
              </a>
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outlined" className="w-[220px] h-[42px]" onClick={disconnect}>
              Disconnect
            </Button>
            <Button className="w-[220px] h-[42px]" onClick={changeConnect}>
              Change
            </Button>
          </div>
        </div>
      )}
      {isShowConnect && <AuthConnectModal />}
    </>
  );
};

export default SwitchConnectModal;
