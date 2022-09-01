import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens, TokenInfo, useCurUserBorrowPrice, useCurUserBorrowAPY, useUserData } from '@store/index';
import tokensIcon from '@assets/tokens';
import Card from '@components/Card';
import Table, { type Columns } from '@components/Table';
import TokenAssets, { type Configs } from '@modules/TokenAssets';
import Button from '@components/Button';
import BalanceText from '@components/BalanceText';
import showBorrowModal from '@service/handleBorrow';
import showRepayModal from '@service/handleRepay';

const Zero = Unit.fromMinUnit(0);
const PointZeroOne = Unit.fromMinUnit(0.0001);
const Hundred = Unit.fromMinUnit(100);

const columns: Columns<TokenInfo> = [
  {
    name: 'Assets',
    width: '16%',
    renderHeader: () => <div className="w-full h-full flex justify-start items-center pl-4px">Assets</div>,
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
    render: ({ symbol, decimals, borrowBalance, borrowPrice }) => (
      <div>
        <p className="font-semibold"><BalanceText balance={borrowBalance} symbol={symbol} decimals={decimals} /></p>
        <p className="text-12px text-#62677B">$<BalanceText balance={borrowPrice} symbol="" decimals={18} /></p>
      </div>
    ),
  },
  {
    name: 'APY',
    width: '25%',
    render: ({ borrowAPY }) => (
      <div className="font-semibold">{`${borrowAPY?.greaterThan(PointZeroOne) ? `${borrowAPY.mul(Hundred).toDecimalMinUnit(2)}%` : '<0.01%'}`}</div>
    ),
  },
  {
    name: '',
    width: '30%',
    render: ({ address, symbol, borrowBalance, availableBorrowBalance }) => (
      <div className="w-full h-full flex justify-end items-center gap-12px">
        <Button
          size="small"
          className="max-w-76px w-50% !flex-shrink-1 lt-md:max-w-none"
          loading={!borrowBalance}
          disabled={borrowBalance?.equalsWith(Zero)}
          onClick={() => showRepayModal({ address, symbol })}
        >
          Repay
        </Button>
        <Button
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
      <div className="mt-16px flex gap-8px flex-wrap">
        <div className="inline-flex items-center px-6px py-2px rounded-4px border-1px border-#EAEBEF">
          Balance
          <span className="ml-6px text-#303549 font-semibold">${curUserBorrowPrice?.toDecimalStandardUnit(2)}</span>
        </div>
        <div className="inline-flex items-center px-6px py-2px rounded-4px border-1px border-#EAEBEF">
          APY
          <span className="ml-6px text-#303549 font-semibold">{curUserBorrowAPY?.mul(Hundred).toDecimalMinUnit(2)}%</span>
        </div>
        <div className="inline-flex items-center px-6px py-2px rounded-4px border-1px border-#EAEBEF">
          Borrow power used
          <span className="ml-6px text-#303549 font-semibold">{userData?.borrowPowerUsed ? `${userData?.borrowPowerUsed}%` : '--'}</span>
        </div>
      </div>

      <Table className="mt-20px" columns={columns} data={curUserBorrowTokens} />
      <TokenAssets className="mt-20px" configs={configs} data={curUserBorrowTokens} />
    </Card>
  );
};

export default YourBorrows;
