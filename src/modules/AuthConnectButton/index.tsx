import React, { useCallback, type ComponentProps } from 'react';
import Button from '@components/Button';
import Network from '@utils/Network';
import { switchToChain } from './connectUtils';
import { showModal } from '@components/showPopup/Modal';
import AuthConnectModal from '@modules/AuthConnectModal';
import { useWalletStore } from '@store/Wallet';
import { walletFunction } from '@utils/wallet';
import { shortenAddress } from '@utils/address';
import SwitchConnectModal from '@modules/SwitchConnectModal';

const SwitchConnect: React.FC = () => {
  const wallet = useWalletStore();
  const account = walletFunction[wallet.name].useAccount();

  const handleClick = useCallback(() => {
    showModal({ Content: <SwitchConnectModal account={account} shortAccount={shortenAddress(account)} />, title: 'Account' });
  }, [account]);

  return (
    <div
      className="flex items-center px-12px h-36px rounded-100px border-1px border-#ebebed1f text-14px text-#F1F1F3 font-semibold cursor-pointer"
      onClick={handleClick}
    >
      {shortenAddress(account)}
    </div>
  );
};

const AuthConnectButton: React.FC<ComponentProps<typeof Button>> = ({ children, ...props }) => {
  const wallet = useWalletStore();
  const status = walletFunction[wallet.name].useStatus();
  const chainId = walletFunction[wallet.name].useChainId();
  const chainMatch = chainId === Network.chainId;

  const handleClick = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (evt) => {
      if (status === 'active' && !chainMatch) {
        switchToChain();
      } else {
        showModal({ Content: <AuthConnectModal />, title: '' });
      }
    },
    [status, chainMatch]
  );

  if (status === 'active' && chainMatch) return <SwitchConnect />;
  return (
    <Button id="auth-connect-btn" {...props} color="green" loading={status === 'in-activating'} onClick={handleClick}>
      {status !== 'active' && 'Connect Wallet'}
      {status === 'active' && !chainMatch && 'Switch Network'}
    </Button>
  );
};

export default AuthConnectButton;
