import React from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useLp } from '@store/index';

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
    totalRewardsPerWeekPrice
  } = useLp();

  return (
    <div className="flex flex-col gap-20px">
      <p>GOL/CFX LP</p>

      <div className="flex justify-between">
        <span>Staking APR</span>
        <span>{stakeAPR?.mul(Hundred).toDecimalMinUnit(2)}%</span>
      </div>

      <div className="flex justify-between">
        <span>LP Token Price</span>
        <span>${usdPrice?.toDecimalMinUnit()}</span>
      </div>

      <div className="flex justify-between">
        <span>Total LP Tokens Staked</span>
        <div className="text-right">
          <p>{totalMarketStakedBalance?.toDecimalStandardUnit()}GOLCFX</p>
          <p>${totalMarketStakedPrice?.toDecimalStandardUnit()}</p>
        </div>
      </div>

      <div className="flex justify-between">
        <span>Your Staked</span>
        <div className="text-right">
          <p>{stakedBalance?.toDecimalStandardUnit()} GOLCFX</p>
          <p>${stakedPrice?.toDecimalStandardUnit()}</p>
        </div>
      </div>

      <div className="flex justify-between">
        <span>Pending Rewards</span>
        <div className="text-right">
          <p>{pendingRewardsBalance?.toDecimalStandardUnit()} Goledo</p>
          <p>${pendingRewardsPrice?.toDecimalStandardUnit()}</p>
        </div>
      </div>

      <div className="flex justify-between">
        <span>Total Rewards per day</span>
        <div className="text-right">
          <p>{totalRewardsPerDayBalance?.toDecimalStandardUnit()} Goledo</p>
          <p>${totalRewardsPerDayPrice?.toDecimalStandardUnit()}</p>
        </div>
      </div>

      <div className="flex justify-between">
        <span>Total Rewards per week</span>
        <div className="text-right">
          <p>{totalRewardsPerWeekBalance?.toDecimalStandardUnit()} Goledo</p>
          <p>${totalRewardsPerWeekPrice?.toDecimalStandardUnit()}</p>
        </div>
      </div>
    </div>
  );
};

export default LP;
