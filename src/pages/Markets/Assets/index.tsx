import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens, TokenInfo } from '@store/index';
import tokensIcon from '@assets/tokens';
import Card from '@components/Card';
import Table, { type Columns } from '@components/Table';
import TokenAssets, { type Configs } from '@modules/TokenAssets';
import Button from '@components/Button';
import Network from '@utils/Network';

const PointZeroOne = Unit.fromMinUnit(0.01);
const Hundred = Unit.fromMinUnit(100);

const columns: Columns<TokenInfo> = [{
  name: 'Assets',
  width: '14%',
  renderHeader: () => <div className='w-full h-full flex justify-start items-center pl-4px'>Assets</div>,
  render: ({ symbol }) => (
    <div className='w-full h-full flex justify-start items-center pl-4px font-semibold'>
      <img className="w-24px h-24px mr-8px" src={tokensIcon[symbol]} alt={symbol} />
      {symbol}
    </div>
  )
}, {
  name: 'Total Supplied',
  width: '21%',
  render: ({ totalMarketSupplyBalance, totalMarketSupplyPrice }) => (
    <div>
      <p className='font-semibold'>{totalMarketSupplyBalance?.toDecimalStandardUnit(2)}</p>
      <p className='text-12px text-#62677B'>${totalMarketSupplyPrice?.toDecimalStandardUnit(2)}</p>
    </div>
  )
}, {
  name: 'Supply APY',
  width: '12%',
  render: ({ supplyAPY }) => <div className='font-semibold'>{`${supplyAPY?.greaterThan(PointZeroOne) ? `${supplyAPY.mul(Hundred).toDecimalMinUnit(2)}%` : '<0.01%'}`}</div>
},{
  name: 'Total Borrowed',
  width: '21%',
  render: ({ totalMarketBorrowBalance, totalMarketBorrowPrice }) => (
    <div>
      <p className='font-semibold'>{totalMarketBorrowBalance?.toDecimalStandardUnit(2)}</p>
      <p className='text-12px text-#62677B'>${totalMarketBorrowPrice?.toDecimalStandardUnit(2)}</p>
    </div>
  )
}, {
  name: 'Borrow APY',
  width: '12%',
  render: ({ borrowAPY }) => <div className='font-semibold'>{`${borrowAPY?.greaterThan(PointZeroOne) ? `${borrowAPY.mul(Hundred).toDecimalMinUnit(2)}%` : '<0.01%'}`}</div>
}, {
  name: '',
  width: '20%',
  render: ({ address }) => (
    <div className='w-full h-full flex justify-end items-center gap-12px'>
      <Button size='small' className='!flex-shrink-1 lt-md:max-w-none lt-md:w-50%'>Vest xxxx Goledo</Button>
      <Link to={`/detail/${address}`} className='max-w-76px w-50% !flex-shrink-1 lt-md:max-w-none no-underline'>
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
    <Card title={`${Network.chainName} Assets`}>
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
