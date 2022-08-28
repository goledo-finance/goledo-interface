import React from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useLp } from '@store/index';
import Card from '@components/Card';
import Button from '@components/Button';

const Hundred = Unit.fromMinUnit(100);

const LP: React.FC = () => {
  const {
    stakeAPR,
    usdPrice,
    totalMarketStakedBalance,
    totalMarketStakedPrice,
    stakedBalance,
    stakedPrice,
    pendingRewardsBalance,
    pendingRewardsPrice,
    totalRewardsPerDayBalance,
    totalRewardsPerDayPrice,
    totalRewardsPerWeekBalance,
    totalRewardsPerWeekPrice,
  } = useLp();

  return (
    <Card title="GOL/CFX LP" titleIcon="i-ri:copper-coin-line" className="flex flex-col gap-0px">
      <div className="flex justify-between items-center h-56px border-b-1px border-#eaebef">
        <span>Staking APR</span>
        <span className='text-#111'>{stakeAPR?.mul(Hundred).toDecimalMinUnit(2)}%</span>
      </div>

      <div className="flex justify-between items-center h-56px border-b-1px border-#eaebef">
        <span>LP Token Price</span>
        <span className='text-#111'>${usdPrice?.toDecimalMinUnit()}</span>
      </div>

      <div className="flex justify-between items-center h-56px border-b-1px border-#eaebef">
        <span>Total LP Tokens Staked</span>
        <div className="text-right">
          <p className='text-#111'>{totalMarketStakedBalance?.toDecimalStandardUnit(2)}GOLCFX</p>
          <p>${totalMarketStakedPrice?.toDecimalStandardUnit(2)}</p>
        </div>
      </div>

      <div className="flex justify-between items-center h-56px border-b-1px border-#eaebef">
        <span>Your Staked</span>
        <div className="text-right">
          <p className='text-#111'>{stakedBalance?.toDecimalStandardUnit(2)} GOLCFX</p>
          <p>${stakedPrice?.toDecimalStandardUnit(2)}</p>
        </div>
      </div>

      <div className="flex justify-between items-center h-56px border-b-1px border-#eaebef">
        <span>Pending Rewards</span>
        <div className="text-right">
          <p className='text-#111'>{pendingRewardsBalance?.toDecimalStandardUnit(2)} Goledo</p>
          <p>${pendingRewardsPrice?.toDecimalStandardUnit(2)}</p>
        </div>
      </div>

      <div className="flex justify-between items-center h-56px border-b-1px border-#eaebef">
        <span>Total Rewards per day</span>
        <div className="text-right">
          <p className='text-#111'>{totalRewardsPerDayBalance?.toDecimalStandardUnit(2)} Goledo</p>
          <p>${totalRewardsPerDayPrice?.toDecimalStandardUnit(2)}</p>
        </div>
      </div>

      <div className="flex justify-between items-center h-56px">
        <span>Total Rewards per week</span>
        <div className="text-right">
          <p className='text-#111'>{totalRewardsPerWeekBalance?.toDecimalStandardUnit(2)} Goledo</p>
          <p>${totalRewardsPerWeekPrice?.toDecimalStandardUnit(2)}</p>
        </div>
      </div>

      <div className='mt-12px flex gap-12px'>
        <Button size='large' className='w-33% !flex-auto'>Stake</Button>
        <Button size='large' className='w-33% !flex-auto'>Unstake</Button>
        <Button size='large' className='w-33% !flex-auto'>Vest</Button>
      </div>
    </Card>
  );
};

export default LP;
