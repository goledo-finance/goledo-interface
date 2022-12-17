import React from 'react';
import { Link } from 'react-router-dom';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens, TokenInfo } from '@store/index';
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

const Zero = Unit.fromMinUnit(0);

const columns: Columns<TokenInfo> = [{
  name: 'Assets',
  width: '14%',
  renderHeader: () => <div className='w-full h-full flex justify-start pl-4px'>Assets</div>,
  render: ({ symbol }) => (
    <div className='w-full h-full flex justify-start items-center pl-4px font-semibold'>
      <img className="w-24px h-24px mr-8px" src={tokensIcon[symbol]} alt={symbol} />
      {symbol}
    </div>
  )
}, {
  name: 'Total Supplied',
  width: '21%',
  render: ({ totalMarketSupplyBalance, totalMarketSupplyPrice, decimals }) => (
    <div>
      <p className='font-semibold'><BalanceText balance={totalMarketSupplyBalance} decimals={decimals} /></p>
      <p className='text-12px text-#62677B'><BalanceText balance={totalMarketSupplyPrice} abbrDecimals={2} symbolPrefix="$" /></p>
    </div>
  )
}, {
  name: 'Supply APY',
  width: '12%',
  render: ({ supplyAPY }) => <div className='font-semibold'><PercentageText value={supplyAPY} /></div>
}, {
  name: 'Total Borrowed',
  width: '21%',
  render: ({ totalMarketBorrowBalance, totalMarketBorrowPrice, decimals }) => (
    <div>
      <p className='font-semibold'><BalanceText balance={totalMarketBorrowBalance} decimals={decimals} /></p>
      <p className='text-12px text-#62677B'><BalanceText balance={totalMarketBorrowPrice} abbrDecimals={2} symbolPrefix="$" /></p>
    </div>
  )
}, {
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
  render: ({ borrowAPY }) => <div className='font-semibold'><PercentageText value={borrowAPY} /></div>
}, {
  name: '',
  width: '20%',
  render: ({ address, earnedGoledoBalance, decimals, symbol }) => (
    <div className='w-full h-full flex justify-end items-center gap-12px'>
      <Button
        id={`markets-assets-vesting-${symbol}-btn`}
        size='small'
        className='!flex-shrink-1 lt-md:max-w-none lt-md:w-50%'
        loading={!earnedGoledoBalance}
        disabled={earnedGoledoBalance?.equals(Zero)}
        onClick={() => handleVestingGoledo({ tokenAddress: address })}
      >
        {earnedGoledoBalance?.greaterThan(Zero) ? <BalanceText balance={earnedGoledoBalance} decimals={decimals} symbol="Goledo" /> : 'None to vest'}
      </Button>
      <Link to={`/detail/${address}`} className='max-w-76px w-50% !flex-shrink-1 lt-md:max-w-none no-underline' id={`markets-assets-details-${symbol}-link`}>
        <Button size='small' variant='outlined' fullWidth>Details</Button>
      </Link>
    </div>
  )
}];

const configs: Configs<TokenInfo> = [{
  name: 'Total Supplied',
  renderContent: columns[1].render,
}, {
  name: 'Supply APY',
  renderContent: columns[2].render,
}, {
  name: 'Total Borrowed',
  renderContent: columns[3].render,
}, {
  name: 'Borrow APY',
  renderContent: columns[4].render,
}, {
  render: columns[5].render,
}];

const Assets: React.FC = () => {
  const tokens = useTokens();

  return (
    <Card title={`${Network.chainName} Assets`} className="!pb-2px">
      <Table
        className='mt-16px'
        columns={columns}
        data={tokens}
      />
      <TokenAssets
        className='mt-16px'
        configs={configs}
        data={tokens}
      />
    </Card>
  );
};

export default Assets;
