import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTokens } from '@store/Tokens';
import { type Unit } from '@cfxjs/use-wallet-react/ethereum';
import SummaryPanel from './SummaryPanel';
import ReserveOverview from './ReserveOverview';

export type Token = NonNullable<ReturnType<typeof useTokens>>[number] & { availableBalance?: Unit; availablePrice?: Unit; };
const Detail: React.FC = () => {
  const { tokenAddress } = useParams() ?? {};
  const tokens = useTokens();
  const token = useMemo(() => tokens?.find(token => token.address === tokenAddress), [tokenAddress, tokens]);
  const { totalMarketSupplyBalance, totalMarketSupplyPrice, totalMarketBorrowBalance, totalMarketBorrowPrice } = token ?? {};

  const availableBalance = useMemo(
    () => (totalMarketSupplyBalance && totalMarketBorrowBalance ? totalMarketSupplyBalance.sub(totalMarketBorrowBalance) : undefined),
    [totalMarketSupplyBalance, totalMarketBorrowBalance]
  );
  const availablePrice = useMemo(
    () => (totalMarketSupplyPrice && totalMarketBorrowPrice ? totalMarketSupplyPrice.sub(totalMarketBorrowPrice) : undefined),
    [totalMarketSupplyPrice, totalMarketBorrowPrice]
  );
  
  if (!token) return null;
  return (
    <div>
      <SummaryPanel {...token} availableBalance={availableBalance} availablePrice={availablePrice} />
      <ReserveOverview {...token} availableBalance={availableBalance} availablePrice={availablePrice} />
    </div>
  );
};


export default Detail;
