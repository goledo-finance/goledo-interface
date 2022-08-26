import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens } from '@store/index';
import PageHeader from '@modules/PageHeader';

const Zero = Unit.fromMinUnit(0);

const SummaryPanelItem: React.FC<{ title: string; value?: string }> = ({ title, value }) => {
  return (
    <div className="flex items-center">
      <span className="flex flex-col text-#160042">
        <span className="inline-block mb-1 text-14px leading-18px">{title}</span>
        <span className=" text-20px leading-24px">{value}</span>
      </span>
    </div>
  );
};

const SummaryPanel: React.FC = () => {
  const tokens = useTokens();
  const allTokensTotalMarketSupplyPrice = useMemo(() => tokens?.reduce((pre, cur) => pre.add(cur.totalMarketSupplyPrice ?? Zero), Zero), [tokens]);
  const allTokensTotalMarketBorrowPrice = useMemo(() => tokens?.reduce((pre, cur) => pre.add(cur.totalMarketBorrowPrice ?? Zero), Zero), [tokens]);
  const allTokensTotalMarketAvailable = useMemo(
    () =>
      allTokensTotalMarketSupplyPrice && allTokensTotalMarketBorrowPrice ? allTokensTotalMarketSupplyPrice?.sub(allTokensTotalMarketBorrowPrice) : undefined,
    [allTokensTotalMarketSupplyPrice, allTokensTotalMarketBorrowPrice]
  );

  return (
    <div className="pt-20px pb-10px xl:pt-36px xl:pb-24px flex flex-col xl:flex-row items-start xl:items-center justify-between">
      <PageHeader />
      <div className="flex gap-64px mt-2 xl:mt-0">
        <SummaryPanelItem title="Total Market Size" value={`$${allTokensTotalMarketSupplyPrice?.toDecimalStandardUnit(2)}`} />
        <SummaryPanelItem title="Total Available" value={`$${allTokensTotalMarketAvailable?.toDecimalStandardUnit(2)}`} />
        <SummaryPanelItem title="Total Borrows" value={`$${allTokensTotalMarketBorrowPrice?.toDecimalStandardUnit(2)}`} />
      </div>
    </div>
  );
};

export default SummaryPanel;
