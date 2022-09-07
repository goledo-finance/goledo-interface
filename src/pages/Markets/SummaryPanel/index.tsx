import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens } from '@store/index';
import ConfluxEspaceMarket from '@modules/ConfluxEspaceMarket';
import BalanceText from '@modules/BalanceText';

const Zero = Unit.fromMinUnit(0);

const SummaryPanelItem: React.FC<{ title: string; value?: React.ReactNode; }> = ({ title, value }) => {
  return (
    <div className=''>
      <p className="text-14px lt-sm:text-12px text-#ccc whitespace-nowrap">{title}</p>
      <p className="text-22px lt-sm:text-18px text-#F1F1F3 font-bold">{value}</p>
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
    <ConfluxEspaceMarket>
      <div className="flex w-full xl:w-fit justify-center gap-56px lt-xl:mt-8px lt-sm:mt-24px lt-sm:gap-24px">
        <SummaryPanelItem title="Total Market Size" value={<BalanceText balance={allTokensTotalMarketSupplyPrice} abbrDecimals={2} symbolPrefix="$" />} />
        <SummaryPanelItem title="Total Available" value={<BalanceText balance={allTokensTotalMarketAvailable} abbrDecimals={2} symbolPrefix="$" />} />
        <SummaryPanelItem title="Total Borrows" value={<BalanceText balance={allTokensTotalMarketBorrowPrice} abbrDecimals={2} symbolPrefix="$" />} />
      </div>
    </ConfluxEspaceMarket>
  );
};

export default SummaryPanel;
