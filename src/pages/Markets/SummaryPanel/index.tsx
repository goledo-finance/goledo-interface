import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens } from '@store/index';

const Zero = Unit.fromMinUnit(0);

const SummaryPanel: React.FC = () => {
  const tokens = useTokens();
  const totalMarketSupplyPrice = useMemo(() => tokens?.reduce((pre, cur) => pre.add(cur.totalSupplyPrice ?? Zero), Zero), [tokens]);
  const totalMarketBorrowPrice = useMemo(() => tokens?.reduce((pre, cur) => pre.add(cur.totalBorrowPrice ?? Zero), Zero), [tokens]);
  const totalMarketAvailable = useMemo(
    () => (totalMarketSupplyPrice && totalMarketBorrowPrice ? totalMarketSupplyPrice?.sub(totalMarketBorrowPrice) : undefined),
    [totalMarketSupplyPrice, totalMarketBorrowPrice]
  );

  return (
    <div className="mb-12px flex gap-12px">
      <b>Total Market Size$: {totalMarketSupplyPrice?.toDecimalStandardUnit(2)}</b>
      <b>Total Available$: {totalMarketAvailable?.toDecimalStandardUnit(2)}</b>
      <b>Total Borrows$: {totalMarketBorrowPrice?.toDecimalStandardUnit(2)}</b>
    </div>
  );
};

export default SummaryPanel;
