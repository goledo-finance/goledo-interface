import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens, TokenInfo, useCurUserBorrowPrice, useCurUserBorrowAPY, useUserData } from '@store/index';
import tokensIcon from '@assets/tokens';
import Card from '@components/Card';
import ToolTip from '@components/Tooltip';
import Table, { type Columns } from '@components/Table';
import TokenAssets, { type Configs } from '@modules/TokenAssets';
import Button from '@components/Button';
import BalanceText from '@modules/BalanceText';
import PercentageText from '@modules/PercentageText';
import showBorrowModal from '@service/handleBorrow';
import showRepayModal from '@service/handleRepay';

const Zero = Unit.fromMinUnit(0);

const columns: Columns<TokenInfo> = [
  {
    name: 'Assets',
    width: '16%',
    renderHeader: () => <div className="w-full h-full flex justify-start pl-4px">Assets</div>,
    render: ({ symbol }) => (
      <div className="w-full h-full flex justify-start items-center pl-4px font-semibold">
        <img className="w-24px h-24px mr-8px" src={tokensIcon[symbol]} alt={symbol} />
        {symbol}
      </div>
    ),
  },
  {
    name: 'DEBT',
    width: '29%',
    render: ({ decimals, borrowBalance, borrowPrice }) => (
      <div>
        <p className="font-semibold">
          <BalanceText balance={borrowBalance} decimals={decimals} />
        </p>
        <p className="text-12px text-#62677B">
          <BalanceText balance={borrowPrice} abbrDecimals={2} symbolPrefix="$" />
        </p>
      </div>
    ),
  },
  {
    name: 'Interest Rate',
    width: '25%',
    render: ({ borrowAPY }) => (
      <div className="font-semibold">
        <PercentageText value={borrowAPY} />
      </div>
    ),
  },
  {
    name: '',
    width: '30%',
    render: ({ address, symbol, borrowBalance, availableBorrowBalance }) => (
      <div className="w-full h-full flex justify-end items-center gap-12px">
        <Button
          id='dashboard-your-borrows-repay-btn'
          size="small"
          className="max-w-76px w-50% !flex-shrink-1 lt-md:max-w-none"
          loading={!borrowBalance}
          disabled={borrowBalance?.equalsWith(Zero)}
          onClick={() => showRepayModal({ address, symbol })}
        >
          Repay
        </Button>
        <Button
          id='dashboard-your-borrows-borrow-btn'
          size="small"
          variant="outlined"
          className="max-w-76px w-50% !flex-shrink-1 lt-md:max-w-none"
          loading={!availableBorrowBalance}
          disabled={availableBorrowBalance?.equalsWith(Zero)}
          onClick={() => showBorrowModal({ address, symbol })}
        >
          Borrow
        </Button>
      </div>
    ),
  },
];

const configs: Configs<TokenInfo> = [
  {
    name: 'Debt',
    renderContent: columns[1].render,
  },
  {
    name: 'Borrow APY',
    renderContent: columns[2].render,
  },
  {
    render: columns[3].render,
  },
];

const YourBorrows: React.FC = () => {
  const tokens = useTokens();
  const curUserBorrowTokens = useMemo(() => tokens?.filter((token) => token.borrowBalance?.greaterThan(Zero)), [tokens]);
  const curUserBorrowPrice = useCurUserBorrowPrice();
  const curUserBorrowAPY = useCurUserBorrowAPY();
  const userData = useUserData();

  return (
    <Card title="Your Borrows" showHideButton="no-pb" className="w-50% lt-2xl:w-full">
      {!curUserBorrowTokens?.length && <p className="mt-40px mb-24px text-center">No Borrows</p>}
      {curUserBorrowTokens?.length ? (
        <>
          <div className="mt-16px flex gap-8px flex-wrap">
            <div className="inline-flex items-center px-6px py-2px rounded-4px border-1px border-#EAEBEF">
              Balance
              <span className="ml-6px text-#303549 font-semibold">
                <BalanceText balance={curUserBorrowPrice} abbrDecimals={2} symbolPrefix="$" />
              </span>
            </div>
            <div className="inline-flex items-center px-6px py-2px rounded-4px border-1px border-#EAEBEF">
              Interest Rate
              <span className="ml-6px text-#303549 font-semibold">
                <PercentageText value={curUserBorrowAPY} />
              </span>
              <ToolTip text="The weighted average of Interest Rate for all borrowed assets, including incentives.">
                <span className="i-bi:info-circle ml-4px cursor-pointer" />
              </ToolTip>
            </div>
            <div className="inline-flex items-center px-6px py-2px rounded-4px border-1px border-#EAEBEF">
              Borrow power used
              <span className="ml-6px text-#303549 font-semibold">
                <PercentageText value={userData?.borrowPowerUsed} />
              </span>
              <ToolTip text="The % of your total borrowing power used. This is based on the amount of your collateral supplied and the total amount that you can borrow.">
                <span className="i-bi:info-circle ml-4px cursor-pointer" />
              </ToolTip>
            </div>
          </div>
          <Table className="mt-20px" columns={columns} data={curUserBorrowTokens} />
          <TokenAssets className="mt-20px" configs={configs} data={curUserBorrowTokens} />
        </>
      ) : null}
    </Card>
  );
};

export default YourBorrows;
