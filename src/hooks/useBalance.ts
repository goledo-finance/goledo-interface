import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useAccount } from '@store/wallet';
import { useEffect, useState } from 'react';

const fetchCFXBalance = (address: string | null | undefined): Promise<Response> => {
  return fetch(import.meta.env.VITE_ESpaceRpcUrl, {
    body: JSON.stringify({
      method: 'eth_getBalance',
      params: [address, 'latest'],
      id: 1,
    }),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  });
};

export const useBalance = () => {
  const [balance, setBalance] = useState(0);
  const account = useAccount();

  useEffect(() => {
    if (account) {
      fetchCFXBalance(account)
        .then((response) => response.json())
        .then((res) => setBalance(res.result));
    }
  }, [account]);

  return Unit.fromStandardUnit(balance);
};
