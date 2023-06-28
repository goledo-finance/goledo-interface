import { useWalletStore, walletStore } from '@store/Wallet';
import Network from '@utils/Network';
import { walletFunction } from '@utils/wallet';

const useIsAuthed = () => {
  const wallet = useWalletStore();
  const status = walletFunction[wallet.name].useStatus();
  const chainId = walletFunction[wallet.name].useChainId();
  const chainMatch = chainId === Network.chainId;

  if (status === 'active' && chainMatch) return true;
  return false;
};

export default useIsAuthed;
