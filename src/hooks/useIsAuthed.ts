import { useAccount, useChainId } from '@store/wallet';
import CurrentNetwork from '@utils/Network';
import { useEffect } from 'react';

const useIsAuthed = () => {
  const account = useAccount();
  const chainId = useChainId();
  const chainMatch = chainId === CurrentNetwork.chainId;
  if (!!account && chainMatch) return true;
  return false;
};

export default useIsAuthed;
