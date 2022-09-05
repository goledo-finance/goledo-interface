import React from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useGoledo } from '@store/index';
import Card from '@components/Card';
import Table, { type Columns } from '@components/Table';
import TokenAssets, { type Configs } from '@modules/TokenAssets';
import Button from '@components/Button';
import BalanceText from '@modules/BalanceText';
import PercentageText from '@modules/PercentageText';
import GoledoIcon from '@assets/tokens/goledo.svg';
import handleVestingGoledo from '@service/handleVestingGoledo';

type Goledo = NonNullable<ReturnType<typeof useGoledo>>;

const columns: Columns<Goledo> = [{
  name: 'Assets',
  width: '10%',
  renderHeader: () => <div className='w-full h-full flex justify-start pl-4px'>Assets</div>,
  render: () => (
    <div className='w-full h-full flex justify-start items-center pl-4px font-semibold'>
      <img className="w-24px h-24px mr-8px" src={GoledoIcon} alt="Goledo" />
      GOL
    </div>
  )
}, {
  name: 'Earned',
  width: '19%',
  render: ({ earnedBalance, earnedPrice }) => (
    <div>
      <p className='font-semibold'><BalanceText balance={earnedBalance} /></p>
      <p className='text-12px text-#62677B'><BalanceText balance={earnedPrice} abbrDecimals={2} symbolPrefix="$" /></p>
    </div>
  )
}, {
  name: 'APY',
  width: '8%',
  render: () => <div className='font-semibold'>0%</div>
}, {
  name: 'Your staked balance',
  width: '24%',
  render: ({ stakedBalance, stakedPrice, stakeAPR }) => (
    <div>
      <div className='flex items-center'>
        <p className='font-semibold'><BalanceText balance={stakedBalance} /></p>
        <div className='ml-8px px-4px py-2px rounded-4px border-1px border-#EAEBEF'>
          <span className='text-#62677B mr-4px'>APR</span>
          <span className='font-semibold'><PercentageText value={stakeAPR} /></span>
        </div>
      </div>
      <p className='text-12px text-#62677B'><BalanceText balance={stakedPrice} abbrDecimals={2} symbolPrefix="$" /></p>
    </div>
  )
}, {
  name: 'Your locked balance',
  width: '24%',
  render: ({ lockedBalance, lockedPrice, lockAPR }) => (
    <div>
      <div className='flex items-center'>
      <p className='font-semibold'><BalanceText balance={lockedBalance} /></p>
        <div className='ml-8px px-4px py-2px rounded-4px border-1px border-#EAEBEF'>
          <span className='text-#62677B mr-4px'>APR</span>
          <span className='font-semibold'><PercentageText value={lockAPR} /></span>
        </div>
      </div>
      <p className='text-12px text-#62677B'><BalanceText balance={lockedPrice} abbrDecimals={2} symbolPrefix="$" /></p>
    </div>
  )
}, {
  name: '',
  width: '15%',
  render: ({ earnedBalance }) => (
    <div className='w-full h-full flex justify-end items-center'>
      <Button
        size='small'
        fullWidth
        className='max-w-164px lt-md:max-w-none'
        loading={!earnedBalance}
        onClick={() => handleVestingGoledo({ tokenAddress: 'all' })}
      >
        Vest
      </Button>
    </div>
  )
}];


const configs: Configs<Goledo> = [{
  name: 'Earned',
  renderContent: columns[1].render,
}, {
  name: 'APY',
  renderContent: columns[2].render,
}, {
  name: 'Your staked balance',
  renderContent: columns[3].render,

}, {
  name: 'Your locked balance',
  renderContent: columns[4].render,
}, {
  render: columns[5].render,
}];

const Rewards: React.FC = () => {
  const data = useGoledo();

  return (
    <Card title="Rewards" showHideButton='no-pb'>
      <Table
        className='mt-16px'
        columns={columns}
        data={[data]}
      />
      <TokenAssets
        className='mt-16px'
        configs={configs}
        data={[data]}
      />
    </Card>
  );
};

export default Rewards;
