import { useState, useRef, useEffect } from 'react';
import { useAccount, useBalance, Unit, provider } from '@cfxjs/use-wallet-react/ethereum';

const useEstimateCfxGasFee = ({ createData, to, isCFX }: { isCFX?: boolean; to: string; createData: (account: string) => string; }) => {
  const count = useRef(0);
  const [cfxGasFee, setCfxGasFee] = useState<Unit | undefined>(undefined);
  const account = useAccount();
  const balance = useBalance();

  useEffect(() => {
    if (isCFX !== true) return;
    const fetcher = async () => {
      if (!provider || !balance || !account) return;
      const minUnitBalance = Unit.lessThan(balance, Unit.fromStandardUnit('16e-12'))
        ? Unit.fromStandardUnit(0).toHexMinUnit()
        : Unit.sub(balance, Unit.fromStandardUnit('16e-12')).toHexMinUnit();
      count.current += 1;
      const fetchCount = count.current;

      Promise.all([
        provider.request({
          method: 'eth_estimateGas',
          params: [
            {
              from: account,
              data: createData(account),
              to,
              value: minUnitBalance,
            },
          ],
        }),
        provider.request({
          method: 'eth_gasPrice',
          params: [],
        }),
      ])
        .then(([estimateGas, gasPrice]) => {
          if (fetchCount !== count.current) return;
          const gasFee = Unit.mul(Unit.mul(Unit.fromMinUnit(estimateGas), Unit.fromMinUnit(gasPrice)), Unit.fromMinUnit('1.5'));
          setCfxGasFee(gasFee);
        }).catch(_ => {})
    };

    fetcher();
  }, [isCFX, balance, account]);

  return cfxGasFee;
};

export default useEstimateCfxGasFee;
