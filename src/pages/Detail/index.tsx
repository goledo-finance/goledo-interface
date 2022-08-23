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
  const { totalSupplyBalance, totalSupplyPrice, totalBorrowBalance, totalBorrowPrice } = token ?? {};

  const availableBalance = useMemo(
    () => (totalSupplyBalance && totalBorrowBalance ? totalSupplyBalance.sub(totalBorrowBalance) : undefined),
    [totalSupplyBalance, totalBorrowBalance]
  );
  const availablePrice = useMemo(
    () => (totalSupplyPrice && totalBorrowPrice ? totalSupplyPrice.sub(totalBorrowPrice) : undefined),
    [totalSupplyPrice, totalBorrowPrice]
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
