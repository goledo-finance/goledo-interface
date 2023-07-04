import React, { useCallback, type ComponentProps } from 'react';
import Button from '@components/Button';
import { showModal } from '@components/showPopup/Modal';
import AuthConnectModal from '@modules/AuthConnectModal';
import { switchChain, useAccount, useChainId } from '@store/wallet';
import { shortenAddress } from '@utils/address';
import SwitchConnectModal from '@modules/SwitchConnectModal';
import CurrentNetwork from '@utils/Network';

const SwitchConnect: React.FC = () => {
  const account = useAccount();

  const handleClick = useCallback(() => {
    showModal({ Content: <SwitchConnectModal account={account} shortAccount={shortenAddress(account ?? '')} />, title: 'Account' });
  }, [account]);

  return (
    <div
      className="flex items-center px-12px h-36px rounded-100px border-1px border-#ebebed1f text-14px text-#F1F1F3 font-semibold cursor-pointer"
      onClick={handleClick}
    >
      {shortenAddress(account ?? '')}
    </div>
  );
};

const AuthConnectButton: React.FC<ComponentProps<typeof Button>> = ({ children, ...props }) => {
  const account = useAccount();
  const chainId = useChainId();
  const chainMatch = chainId === CurrentNetwork.chainId;

  const handleClick = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (evt) => {
      if (account && !chainMatch) {
        switchChain();
      } else {
        showModal({ Content: <AuthConnectModal />, title: '' });
      }
    },
    [account, chainMatch]
  );

  if (account && chainMatch) return <SwitchConnect />;
  return (
    <Button id="auth-connect-btn" {...props} color="green" onClick={handleClick}>
      {!account && 'Connect Wallet'}
      {!!account && !chainMatch && 'Switch Network'}
    </Button>
  );
};

export default AuthConnectButton;
