import React from 'react';
import { Link } from 'react-router-dom';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens, TokenInfo } from '@store/index';
import tokensIcon from '@assets/tokens';
import Card from '@components/Card';
import Table, { type Columns } from '@components/Table';
import TokenAssets, { type Configs } from '@modules/TokenAssets';
import Button from '@components/Button';
import showBorrowModal from '@service/handleBorrow';

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
    name: 'Available',
    width: '29%',
    render: ({ availableBorrowBalance }) => <div className="font-semibold">{availableBorrowBalance?.toDecimalStandardUnit(2)}</div>,
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
    render: ({ address, symbol, availableBorrowBalance }) => (
      <div className="w-full h-full flex justify-end items-center gap-12px">
        <Button
          size="small"
          className="max-w-76px w-50% !flex-shrink-1 lt-md:max-w-none"
          loading={!availableBorrowBalance}
          onClick={() => showBorrowModal({ address, symbol })}
        >
          Borrow
        </Button>

        <Link to={`/detail/${address}`} className='max-w-76px w-50% !flex-shrink-1 lt-md:max-w-none no-underline'>
          <Button size='small' variant='outlined' fullWidth>Details</Button>
        </Link>
      </div>
    ),
  },
];

const configs: Configs<TokenInfo> = [
  {
    name: 'Available to Borrow',
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

const AssetsToBorrow: React.FC = () => {
  const tokens = useTokens();

  return (
    <Card title="Assets to Borrow" showHideButton="no-pb" className="w-50% lt-2xl:w-full">
      <Table className="mt-16px" columns={columns} data={tokens} />
      <TokenAssets className="mt-16px" configs={configs} data={tokens} />
    </Card>
  );
};

export default AssetsToBorrow;
