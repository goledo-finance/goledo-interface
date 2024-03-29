import { useState, useRef, useEffect } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useAccount, useBalance } from '@store/wallet';
import { fetchChain } from '@utils/fetchChain';

const useEstimateCfxGasFee = ({
  createData,
  to,
  isCFX,
  amount,
}: {
  isCFX?: boolean;
  to: string;
  amount?: Unit;
  createData: ({ amount, account }: { amount: string; account: string }) => string;
}) => {
  const count = useRef(0);
  const [cfxGasFee, setCfxGasFee] = useState<Unit | undefined>(undefined);
  const account = useAccount();
  const balance = useBalance();

  useEffect(() => {
    if (isCFX !== true) return;
    const fetcher = async () => {
      if (!account) return;
      const usedAmount = amount || balance;
      if (!usedAmount) return;
      const minUnitAmount = Unit.lessThan(usedAmount, Unit.fromStandardUnit('16e-12'))
        ? Unit.fromStandardUnit(0).toHexMinUnit()
        : Unit.sub(usedAmount, Unit.fromStandardUnit('16e-12')).toHexMinUnit();
      count.current += 1;
      const fetchCount = count.current;

      Promise.all([
        fetchChain({
          rpcUrl: import.meta.env.VITE_ESpaceRpcUrl,
          method: 'eth_estimateGas',
          params: [
            {
              from: account,
              data: createData({ account, amount: minUnitAmount }),
              to,
              value: minUnitAmount,
            },
          ],
        }),
        fetchChain({
          rpcUrl: import.meta.env.VITE_ESpaceRpcUrl,
          method: 'eth_gasPrice',
          params: [],
        }),
      ])
        .then(([estimateGas, gasPrice]) => {
          if (fetchCount !== count.current) return;
          const gasFee = Unit.mul(Unit.mul(Unit.fromMinUnit(estimateGas), Unit.fromMinUnit(gasPrice)), Unit.fromMinUnit('1.5'));
          setCfxGasFee(gasFee);
        })
        .catch(() => {});
    };

    fetcher();
  }, [isCFX, balance, amount, account]);

  return cfxGasFee;
};

export default useEstimateCfxGasFee;
