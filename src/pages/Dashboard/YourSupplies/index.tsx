import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens, useCurUserSupplyAPY, useCurUserSupplyPrice, type TokenInfo } from '@store/index';
import tokensIcon from '@assets/tokens';
import Card from '@components/Card';
import Table, { type Columns } from '@components/Table';
import Toggle from '@components/Toggle';
import TokenAssets, { type Configs } from '@modules/TokenAssets';
import Button from '@components/Button';
import showWithdrawModal from '@service/handleWithdraw';

const Zero = Unit.fromMinUnit(0);
const PointZeroOne = Unit.fromMinUnit(0.0001);
const Hundred = Unit.fromMinUnit(100);

const columns: Columns<TokenInfo> = [{
  name: 'Assets',
  width: '13%',
  renderHeader: () => <div className='w-full h-full flex justify-start items-center pl-4px'>Assets</div>,
  render: ({ symbol }) => (
    <div className='w-full h-full flex justify-start items-center pl-4px font-semibold'>
      <img className="w-24px h-24px mr-8px" src={tokensIcon[symbol]} alt={symbol} />
      {symbol}
    </div>
  )
}, {
  name: 'Balance',
  width: '24%',
  render: ({ supplyBalance, supplyPrice }) => (
    <div>
      <p className='font-semibold'>{supplyBalance?.toDecimalStandardUnit(2)}</p>
      <p className='text-12px text-#62677B'>${supplyPrice?.toDecimalStandardUnit(2)}</p>
    </div>
  )
}, {
  name: 'APY',
  width: '18%',
  render: ({ supplyAPY }) => <div className='font-semibold'>{`${supplyAPY?.greaterThan(PointZeroOne) ? `${supplyAPY.mul(Hundred).toDecimalMinUnit(2)}%` : '<0.01%'}`}</div>
}, {
  name: 'Collateral',
  width: '17%',
  renderHeader: () => <div className='flex justify-center items-center'>Collateral</div>,
  render: () => (
    <div className='flex items-center'>
      <Toggle checked />
    </div>
  )
}, {
  name: '',
  width: '28%',
  render: ({ address, symbol, supplyBalance }) => (
    <div className='w-full h-full flex justify-end items-center'>
      <Button
        size='small'
        fullWidth
        className='max-w-164px lt-md:max-w-none'
        loading={!supplyBalance}
        disabled={supplyBalance?.equalsWith(Zero)}
        onClick={() => showWithdrawModal({ address, symbol })}
      >
        Withdraw
      </Button>
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
  name: 'Used as collateral',
  renderContent: columns[3].render,

},{
  render: columns[4].render,
}];


const YourSupplies: React.FC = () => {
  const tokens = useTokens();
  const curUserSupplyTokens = useMemo(() => tokens?.filter((token) => token.supplyBalance?.greaterThan(Zero)), [tokens]);
  const curUserSupplyPrice = useCurUserSupplyPrice();
  const curUserSupplyAPY = useCurUserSupplyAPY();
  const totalCollateralPrice = useMemo(
    () =>
      !curUserSupplyTokens?.length
        ? undefined
        : curUserSupplyTokens.filter((token) => token.collateral).reduce((pre, cur) => pre.add(cur.supplyPrice ?? Zero), Zero),
    [curUserSupplyTokens]
  );

  return (
    <Card title='Your Supplies' showHideButton='no-pb' className='w-50% lt-2xl:w-full'>
      <div className='mt-16px flex gap-8px flex-wrap'>
        <div className='inline-flex items-center px-6px py-2px rounded-4px border-1px border-#EAEBEF'>
          Balance
          <span className='ml-6px text-#303549 font-semibold'>${curUserSupplyPrice?.toDecimalStandardUnit(2)}</span>
        </div>
        <div className='inline-flex items-center px-6px py-2px rounded-4px border-1px border-#EAEBEF'>
          APY
          <span className='ml-6px text-#303549 font-semibold'>{curUserSupplyAPY?.mul(Hundred).toDecimalMinUnit(2)}%</span>
        </div>
        <div className='inline-flex items-center px-6px py-2px rounded-4px border-1px border-#EAEBEF'>
          Collateral
          <span className='ml-6px text-#303549 font-semibold'>${totalCollateralPrice?.toDecimalStandardUnit(2)}</span>
        </div>
      </div>
      <Table
        className='mt-20px'
        columns={columns}
        data={curUserSupplyTokens}
      />
      <TokenAssets
        className='mt-20px'
        configs={configs}
        data={curUserSupplyTokens}
      />
    </Card>
  );
};

export default YourSupplies;
