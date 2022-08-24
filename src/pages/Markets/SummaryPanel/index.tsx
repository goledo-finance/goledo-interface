import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens } from '@store/index';

const Zero = Unit.fromMinUnit(0);

const SummaryPanel: React.FC = () => {
  const tokens = useTokens();
  const allTokensTotalMarketSupplyPrice = useMemo(() => tokens?.reduce((pre, cur) => pre.add(cur.totalMarketSupplyPrice ?? Zero), Zero), [tokens]);
  const allTokensTotalMarketBorrowPrice = useMemo(() => tokens?.reduce((pre, cur) => pre.add(cur.totalMarketBorrowPrice ?? Zero), Zero), [tokens]);
  const allTokensTotalMarketAvailable = useMemo(
    () => (allTokensTotalMarketSupplyPrice && allTokensTotalMarketBorrowPrice ? allTokensTotalMarketSupplyPrice?.sub(allTokensTotalMarketBorrowPrice) : undefined),
    [allTokensTotalMarketSupplyPrice, allTokensTotalMarketBorrowPrice]
  );

  return (
    <div className="mb-12px flex gap-12px">
      <b>Total Market Size$: {allTokensTotalMarketSupplyPrice?.toDecimalStandardUnit(2)}</b>
      <b>Total Available$: {allTokensTotalMarketAvailable?.toDecimalStandardUnit(2)}</b>
      <b>Total Borrows$: {allTokensTotalMarketBorrowPrice?.toDecimalStandardUnit(2)}</b>
    </div>
  );
};

export default SummaryPanel;
