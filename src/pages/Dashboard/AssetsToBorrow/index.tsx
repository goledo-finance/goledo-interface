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
import showBorrowModal from '@service/handleBorrow';

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
    name: 'Available',
    width: '29%',
    renderHeader: () => (
      <div className="flex justify-center items-center">
        Available
        <ToolTip text="This is the total amount available for you to borrow. You can borrow based on your collateral and until the borrow cap is reached.">
          <span className="i-bi:info-circle ml-4px cursor-pointer" />
        </ToolTip>
      </div>
    ),
    render: ({ availableBorrowBalance, decimals }) => <div className="font-semibold"><BalanceText balance={availableBorrowBalance} decimals={decimals} /></div>,
  },
  {
    name: 'Interest Rate',
    width: '25%',
    renderHeader: () => (
      <div className="flex justify-center items-center">
        Interest Rate
        <ToolTip text="Interest rate will fluctuate based on the market conditions. Recommended for short-term loans.">
          <span className="i-bi:info-circle ml-4px cursor-pointer" />
        </ToolTip>
      </div>
    ),
    render: ({ borrowAPY }) => (
      <div className="font-semibold"><PercentageText value={borrowAPY} /></div>
    ),
  },
  {
    name: '',
    width: '30%',
    render: ({ address, symbol, availableBorrowBalance }) => (
      <div className="w-full h-full flex justify-end items-center gap-12px">
        <Button
          id='dashboard-assets-to-borrow-btn'
          size="small"
          className="max-w-76px w-50% !flex-shrink-1 lt-md:max-w-none"
          loading={!availableBorrowBalance}
          disabled={availableBorrowBalance?.equalsWith(Zero)}
          onClick={() => showBorrowModal({ address, symbol })}
        >
          Borrow
        </Button>

        <Link to={`/detail/${address}`} className='max-w-76px w-50% !flex-shrink-1 lt-md:max-w-none no-underline' id='dashboard-assets-to-borrow-link'>
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
    name: 'Borrow Interest Rate',
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
