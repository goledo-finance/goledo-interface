import { useStatus, useChainId } from '@cfxjs/use-wallet-react/ethereum';
import Network from '@utils/Network';

const useIsAuthed = () => {
  const status = useStatus();
  const chainId = useChainId();
  const chainMatch = chainId === Network.chainId;

  if (status === 'active' && chainMatch) return true;
  return false;
};

export default useIsAuthed;
