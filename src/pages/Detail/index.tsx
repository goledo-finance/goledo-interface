import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTokens, type TokenInfo} from '@store/Tokens';
import { type Unit } from '@cfxjs/use-wallet-react/ethereum';
import PageHeader from '@modules/Layout/PageHeader';
import PageWrapper from '@modules/Layout/PageWrapper';
import SummaryPanel from './SummaryPanel';
import ReserveOverview from './ReserveOverview';
import Supplies from './Supplies';
import Borrows from './Borrows';

export type Token = TokenInfo & { availableBalance?: Unit; availablePrice?: Unit; };
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
    <>
      <PageHeader className='pt-32px lt-md:pt-14px'>
        <SummaryPanel {...token} availableBalance={availableBalance} availablePrice={availablePrice} />
      </PageHeader>
      <PageWrapper>
        <div className='flex gap-16px lt-lg:flex-col'>
          <ReserveOverview {...token} availableBalance={availableBalance} availablePrice={availablePrice} />
          <div className='w-36% flex-auto flex flex-col gap-16px lt-lg:w-full'>
            <Supplies  {...token} />
            <Borrows  {...token} />
          </div>
        </div>
      </PageWrapper>
    </>
  );
};


export default Detail;
