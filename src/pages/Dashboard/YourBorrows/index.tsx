import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens, TokenInfo, useCurUserBorrowPrice, useCurUserBorrowAPY, useUserData, useGoledoTokensAPR } from '@store/index';
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

const columns: Columns<TokenInfo, { goledoTokensAPR: Record<string, Unit> | undefined }> = [
  {
    name: 'Assets',
    width: '13%',
    renderHeader: () => <div className="w-full h-full flex justify-start pl-4px">Assets</div>,
    render: ({ symbol }) => (
      <div className="w-full h-full flex justify-start items-center pl-4px font-semibold">
        <img className="w-24px h-24px mr-8px rounded-full" src={tokensIcon[symbol]} alt={symbol} />
        {symbol}
      </div>
    ),
  },
  {
    name: 'DEBT',
    width: '24%',
    render: ({ decimals, borrowBalance, borrowPrice, symbol }) => (
      <div>
        <p className="font-semibold">
          <BalanceText balance={borrowBalance} decimals={decimals} id={`dashboard-your-borrows-borrow-balance-${symbol}`} />
        </p>
        <p className="text-12px text-#62677B">
          <BalanceText balance={borrowPrice} abbrDecimals={2} symbolPrefix="$" id={`dashboard-your-borrows-borrow-price-${symbol}`} />
        </p>
      </div>
    ),
  },
  // {
  //   name: 'Interest Rate',
  //   width: '18%',
  //   render: ({ borrowAPY, symbol }) => (
  //     <div className="font-semibold">
  //       <PercentageText value={borrowAPY} id={`dashboard-your-borrows-borrow-apy-${symbol}`} />
  //     </div>
  //   ),
  // },
  // {
  //   name: 'GOL APR',
  //   width: '17%',
  //   render: ({ symbol, borrowTokenAddress }, { goledoTokensAPR } = { goledoTokensAPR: undefined }) => (
  //     <div className="font-semibold">
  //       <PercentageText className="font-semibold" id={`dashboard-assets-borrow-APR-${symbol}`} value={goledoTokensAPR?.[borrowTokenAddress]} />
  //     </div>
  //   ),
  // },
  {
    name: '',
    width: '28%',
    render: ({ address, symbol, borrowBalance, availableBorrowBalance }) => (
      <div className="w-full h-full flex justify-end items-center gap-12px">
        <Button
          id={`dashboard-your-borrows-repay-btn-${symbol}`}
          size="small"
          className="max-w-76px w-50% !flex-shrink-1 lt-md:max-w-none"
          loading={!borrowBalance}
          disabled={borrowBalance?.equalsWith(Zero)}
          onClick={() => showRepayModal({ address, symbol })}
        >
          Repay
        </Button>
        <Button
          id={`dashboard-your-borrows-borrow-btn-${symbol}`}
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

const configs: Configs<TokenInfo, { goledoTokensAPR: Record<string, Unit> | undefined }> = [
  {
    name: 'Debt',
    renderContent: columns[1].render,
  },
  // {
  //   name: 'Borrow APY',
  //   renderContent: columns[2].render,
  // },
  // {
  //   name: 'Goledo APR',
  //   renderContent: columns[3].render,
  // },
  {
    render: columns[2].render,
  },
];

const YourBorrows: React.FC = () => {
  const tokens = useTokens();
  const goledoTokensAPR = useGoledoTokensAPR();
  const curUserBorrowTokens = useMemo(() => tokens?.filter((token) => token.borrowBalance?.greaterThan(Zero)), [tokens]);
  const curUserBorrowPrice = useCurUserBorrowPrice();
  const curUserBorrowAPY = useCurUserBorrowAPY();
  const curUserBorrowGoledoAPR = useMemo(() => {
    if (!curUserBorrowTokens?.length || !curUserBorrowPrice || !goledoTokensAPR) return undefined;
    return curUserBorrowTokens
      .reduce((acc, { borrowTokenAddress, borrowPrice }) => {
        const goledoTokenAPR = goledoTokensAPR?.[borrowTokenAddress];
        if (!goledoTokenAPR || !curUserBorrowPrice || !borrowPrice) return acc.add(Zero);
        const apr = borrowPrice?.mul(goledoTokenAPR).div(curUserBorrowPrice);
        return acc.add(apr);
      }, new Unit(0));
  }, [curUserBorrowTokens, goledoTokensAPR, curUserBorrowPrice]);

  const userData = useUserData();

  return (
    <Card title="You're borrowing" showHideButton="no-pb" className="w-50% lt-2xl:w-full" id="dashboard-your-borrows-card">
      {!curUserBorrowTokens?.length && <p className="mt-40px mb-24px text-center">None Borrowed</p>}
      {curUserBorrowTokens?.length ? (
        <>
          <div className="mt-16px flex gap-8px flex-wrap">
            <div className="inline-flex items-center px-6px py-2px rounded-4px border-1px border-#EAEBEF">
              Balance
              <span className="ml-6px text-#303549 font-semibold">
                <BalanceText balance={curUserBorrowPrice} abbrDecimals={2} symbolPrefix="$" id="dashboard-your-borrows-borrow-price" />
              </span>
            </div>
            {/* <div className="inline-flex items-center px-6px py-2px rounded-4px border-1px border-#EAEBEF">
              Interest Rate
              <span className="ml-6px text-#303549 font-semibold">
                <PercentageText value={curUserBorrowAPY} id="dashboard-your-borrows-borrow-apy" />
              </span>
              <ToolTip text="The weighted average of Interest Rate for all borrowed assets.">
                <span className="i-bi:info-circle ml-4px cursor-pointer" />
              </ToolTip>
            </div> */}
            {/* <div className="inline-flex items-center px-6px py-2px rounded-4px border-1px border-#EAEBEF">
              GOL APR
              <span className="ml-6px text-#303549 font-semibold">
                <PercentageText value={curUserBorrowGoledoAPR} id="dashboard-your-borrows-borrow-power-used" />
              </span>
            </div> */}
            <div className="inline-flex items-center px-6px py-2px rounded-4px border-1px border-#EAEBEF">
              Power used
              <span className="ml-6px text-#303549 font-semibold">
                <PercentageText value={userData?.borrowPowerUsed} id="dashboard-your-borrows-borrow-power-used" />
              </span>
              <ToolTip text="The % of your total borrowing power used. This is based on the amount of your collateral supplied and the total amount that you can borrow.">
                <span className="i-bi:info-circle ml-4px cursor-pointer" />
              </ToolTip>
            </div>
          </div>
          <Table className="mt-20px" columns={columns} data={curUserBorrowTokens} otherData={{ goledoTokensAPR }} />
          <TokenAssets className="mt-20px" configs={configs} data={curUserBorrowTokens} otherData={{ goledoTokensAPR }} />
        </>
      ) : null}
    </Card>
  );
};

export default YourBorrows;
