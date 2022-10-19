import React from 'react';
import { Link } from 'react-router-dom';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens, TokenInfo } from '@store/index';
import tokensIcon from '@assets/tokens';
import Card from '@components/Card';
import Table, { type Columns } from '@components/Table';
import TokenAssets, { type Configs } from '@modules/TokenAssets';
import Button from '@components/Button';
import BalanceText from '@modules/BalanceText';
import PercentageText from '@modules/PercentageText';
import showSupplyModal from '@service/handleSupply';

const Zero = Unit.fromMinUnit(0);

const columns: Columns<TokenInfo> = [{
  name: 'Assets',
  width: '13%',
  renderHeader: () => <div className='w-full h-full flex justify-start pl-4px'>Assets</div>,
  render: ({ symbol }) => (
    <div className='w-full h-full flex justify-start items-center pl-4px font-semibold'>
      <img className="w-24px h-24px mr-8px" src={tokensIcon[symbol]} alt={symbol} />
      {symbol}
    </div>
  )
}, {
  name: 'Balance',
  width: '24%',
  render: ({ balance, decimals }) => <div className='font-semibold'><BalanceText balance={balance} decimals={decimals} /></div>

}, {
  name: 'APY',
  width: '18%',
  render: ({ supplyAPY }) => <div className='font-semibold'><PercentageText value={supplyAPY} /></div>
}, {
  name: 'Can be collateral',
  width: '17%',
  render: ({ canBeCollateral }) => (
    <div className='flex items-center'>
      {canBeCollateral && <span className='i-charm:circle-tick text-18px text-#3AC170' />}
      {canBeCollateral === false && '--'}
    </div>
  )
}, {
  name: '',
  width: '28%',
  render: ({ address, symbol, balance }) => (
    <div className='w-full h-full flex justify-end items-center gap-12px'>
      <Button
        size='small'
        className='max-w-76px w-50% !flex-shrink-1 lt-md:max-w-none'
        id='dashboard-assets-to-supply-btn'
        loading={!balance}
        disabled={balance?.equalsWith(Zero)}
        onClick={() => showSupplyModal({ address, symbol })}
      >
        Supply
      </Button>

      <Link to={`/detail/${address}`} className='max-w-76px w-50% !flex-shrink-1 lt-md:max-w-none no-underline' id='dashboard-assets-to-supply-link'>
        <Button size='small' variant='outlined' fullWidth>Details</Button>
      </Link>
    </div>
  )
}];

const configs: Configs<TokenInfo> = [{
  name: 'Supply Balance',
  renderContent: columns[1].render,
}, {
  name: 'Supply APY',
  renderContent: columns[2].render,
}, {
  name: 'Can be collateral',
  renderContent: columns[3].render,
}, {
  render: columns[4].render,
}];

const AssetsToSupply: React.FC = () => {
  const tokens = useTokens();

  return (
    <Card title='Assets to Supply' showHideButton='no-pb' className='w-50% lt-2xl:w-full'>
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

export default AssetsToSupply;
