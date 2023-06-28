import React from 'react';
import cx from 'clsx';
import { showToast } from '@components/showPopup/Toast';
import { setWalletStore } from '@store/Wallet';
import { walletConfig, walletFunction } from '@utils/wallet';
import { hideAllModal } from '@components/showPopup/Modal';

interface Wallet {
  name: string;
  index: number;
  icon: Array<string>;
  connect: () => Promise<string[]>;
  useStatus: () => 'in-detecting' | 'not-installed' | 'not-active' | 'in-activating' | 'active' | 'chain-error';
}

export async function connectToWallet(index: number) {
  const connect = walletFunction[walletConfig[index].name].connect;
  try {
    const accounts = await connect();
    showToast(`Connect to Wallet Success!`, { type: 'success' });
    hideAllModal();
    setWalletStore(walletConfig[index]);
    return accounts?.[0];
  } catch (err) {
    if ((err as any)?.code === 4001) {
      showToast('You cancel the connection reqeust.', { type: 'failed' });
    }
  }
  return undefined;
}

const AuthConnectOption: React.FC<Wallet> = ({ name, icon, connect, useStatus, index }) => {
  const status = useStatus();
  return (
    <div
      className={cx(
        'border-2 border-[#1e1e1e] border-solid rounded-[4px] flex h-[70px] my-[16px] items-center justify-between pl-[40px] pr-[24px] cursor-pointer',
        (status === 'active' || status === 'not-installed') && 'cursor-not-allowed'
      )}
      onClick={() => connectToWallet(index)}
    >
      <div className="font-[18px] font-bold">{name}</div>
      <div>
        {icon.map((item, index) => (
          <img
            src={item}
            key={index}
            alt="icon"
            className={cx('w-[40px] h-[40px] relative', index !== 0 && '-ml-[15px]', index === 0 && 'z-30', index === 1 && 'z-20')}
          />
        ))}
      </div>
    </div>
  );
};

export default AuthConnectOption;
