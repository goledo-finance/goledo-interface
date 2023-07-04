import React from 'react';
import cx from 'clsx';
import { showToast } from '@components/showPopup/Toast';
import { connect, Methods, setAccountMethod, useAccountMethod, walletConfig, walletFunction } from '@store/wallet';
import { hideAllModal } from '@components/showPopup/Modal';

interface Wallet {
  name: string;
  icon: Array<string>;
}

export async function connectToWallet(name: Methods) {
  try {
    const accounts = await connect(name);
    showToast(`Connect to Wallet Success!`, { type: 'success' });
    hideAllModal();
    setAccountMethod(name as Methods);
    return accounts?.[0];
  } catch (err) {
    if ((err as any)?.code === 4001) {
      showToast('You cancel the connection reqeust.', { type: 'failed' });
    }
  }
  return undefined;
}

const AuthConnectOption: React.FC<Wallet> = ({ name, icon }) => {
  const method = useAccountMethod();
  return (
    <div
      className={cx(
        'border-2 border-[#1e1e1e] border-solid rounded-[4px] flex h-[70px] my-[16px] items-center justify-between pl-[40px] pr-[24px] cursor-pointer',
        'hover:bg-black hover:text-white'
      )}
      onClick={() => connectToWallet(name as Methods)}
    >
      <div className="font-[18px] font-bold flex items-center">
        {name === method && <div className="h-[8px] w-[8px] rounded-[8px] bg-[#65be78] -ml-[16px] mr-[8px]" />}
        {name}
      </div>
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
