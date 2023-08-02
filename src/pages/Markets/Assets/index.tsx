import React from 'react';
import { Link } from 'react-router-dom';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens, TokenInfo, useGoledoTokensAPR } from '@store/index';
import tokensIcon from '@assets/tokens';
import Card from '@components/Card';
import ToolTip from '@components/Tooltip';
import Table, { type Columns } from '@components/Table';
import TokenAssets, { type Configs } from '@modules/TokenAssets';
import Button from '@components/Button';
import BalanceText from '@modules/BalanceText';
import PercentageText from '@modules/PercentageText';
import Network from '@utils/Network';
import handleVestingGoledo from '@service/handleVestingGoledo';
import tokenIcons from '@assets/tokens';

const Zero = Unit.fromMinUnit(0);

const columns: Columns<TokenInfo, { goledoTokensAPR: Record<string, Unit> | undefined }> = [
  {
    name: 'Assets',
    width: '8%',
    renderHeader: () => <div className="w-full h-full flex justify-start pl-4px">Assets</div>,
    render: ({ symbol }) => (
      <div className="w-full h-full flex justify-start items-center pl-4px font-semibold">
        <img className="w-24px h-24px mr-8px" src={tokensIcon[symbol]} alt={symbol} />
        {symbol}
      </div>
    ),
  },
  {
    name: 'Total Supplied',
    width: '18%',
    render: ({ totalMarketSupplyBalance, totalMarketSupplyPrice, decimals }) => (
      <div>
        <p className="font-semibold">
          <BalanceText balance={totalMarketSupplyBalance} decimals={decimals} />
        </p>
        <p className="text-12px text-#62677B">
          <BalanceText balance={totalMarketSupplyPrice} abbrDecimals={2} symbolPrefix="$" />
        </p>
      </div>
    ),
  },
  {
    name: 'Supply Rewards',
    width: '12%',
    render: ({ supplyAPY, symbol, supplyTokenAddress }, { goledoTokensAPR } = { goledoTokensAPR: undefined }) => (
      <div className="font-semibold">
        <PercentageText value={supplyAPY} />
        <div className="ml-8px mt-4px flex justify-center items-center px-4px py-2px rounded-4px border-1px border-#EAEBEF text-12px">
          <img className="w-14px h-14px" src={tokenIcons.GOL} alt="/" />
          <span className="text-#62677B mx-4px">APR</span>
          <PercentageText className="font-semibold" value={goledoTokensAPR?.[supplyTokenAddress]} />
        </div>
      </div>
    ),
  },
  {
    name: 'Total Borrowed',
    width: '18%',
    render: ({ totalMarketBorrowBalance, totalMarketBorrowPrice, decimals }) => (
      <div>
        <p className="font-semibold">
          <BalanceText balance={totalMarketBorrowBalance} decimals={decimals} />
        </p>
        <p className="text-12px text-#62677B">
          <BalanceText balance={totalMarketBorrowPrice} abbrDecimals={2} symbolPrefix="$" />
        </p>
      </div>
    ),
  },
  {
    name: 'Borrow APY',
    width: '12%',
    renderHeader: () => (
      <div className="flex justify-center items-center">
        Borrow APY
        <ToolTip text="Interest rate will fluctuate based on the market conditions. Recommended for short-term loans.">
          <span className="i-bi:info-circle ml-4px cursor-pointer" />
        </ToolTip>
      </div>
    ),
    render: ({ borrowAPY }) => (
      <div className="font-semibold">
        <PercentageText value={borrowAPY} />
      </div>
    ),
  },
  {
    name: 'Goledo APR',
    width: '12%',
    renderHeader: () => (
      <div className="flex justify-center items-center">
        Goledo APR
        <ToolTip text="Borrowing incentives">
          <span className="i-bi:info-circle ml-4px cursor-pointer" />
        </ToolTip>
      </div>
    ),
    render: ({ symbol, borrowTokenAddress }, { goledoTokensAPR } = { goledoTokensAPR: undefined }) => (
      <div className="font-semibold">
        <PercentageText className="font-semibold" id={`dashboard-assets-borrow-APR-${symbol}`} value={goledoTokensAPR?.[borrowTokenAddress]} />
      </div>
    ),
  },
  {
    name: '',
    width: '20%',
    render: ({ address, earnedGoledoBalance, decimals, symbol }) => (
      <div className="w-full h-full flex justify-end items-center gap-12px">
        <Button
          id={`markets-assets-vesting-${symbol}-btn`}
          size="small"
          className="!flex-shrink-1 lt-md:max-w-none lt-md:w-50%"
          loading={!earnedGoledoBalance}
          disabled={earnedGoledoBalance?.equals(Zero)}
          onClick={() => handleVestingGoledo({ tokenAddress: address })}
        >
          {earnedGoledoBalance?.greaterThan(Zero) ? <BalanceText balance={earnedGoledoBalance} decimals={decimals} symbol="Goledo" /> : 'None to vest'}
        </Button>
        <Link to={`/detail/${address}`} className="max-w-76px w-50% !flex-shrink-1 lt-md:max-w-none no-underline" id={`markets-assets-details-${symbol}-link`}>
          <Button size="small" variant="outlined" fullWidth>
            Details
          </Button>
        </Link>
      </div>
    ),
  },
];

const configs: Configs<TokenInfo, { goledoTokensAPR: Record<string, Unit> | undefined }> = [
  {
    name: 'Total Supplied',
    renderContent: columns[1].render,
  },
  {
    name: 'Supply Rewards',
    renderContent: columns[2].render,
  },
  {
    name: 'Total Borrowed',
    renderContent: columns[3].render,
  },
  {
    name: 'Borrow APY',
    renderContent: columns[4].render,
  },
  {
    name: 'Goledo APR',
    renderContent: columns[5].render,
  },
  {
    render: columns[6].render,
  },
];

const Assets: React.FC = () => {
  const tokens = useTokens();
  const goledoTokensAPR = useGoledoTokensAPR();

  return (
    <Card title={`${Network.chainName} Assets`} className="!pb-2px">
      <Table className="mt-16px" columns={columns} data={tokens} otherData={{ goledoTokensAPR }} />
      <TokenAssets className="mt-16px" configs={configs} data={tokens} otherData={{ goledoTokensAPR }} />
    </Card>
  );
};

export default Assets;
