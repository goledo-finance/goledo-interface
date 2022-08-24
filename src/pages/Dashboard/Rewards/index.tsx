import React from 'react';
import { useGoledoEarnedBalance, useGoledoStakedBalance, useGoledoLockedBalance } from '@store/index';


const Rewards: React.FC = () => {
  const earnedBalance = useGoledoEarnedBalance();
  const stakedBalance = useGoledoStakedBalance();
  const lockedBalance = useGoledoLockedBalance();

  return (
    <div>
      <h3>Rewards</h3>

      <div className='flex gap-24px'>
        <span>GOL</span>
        <span>Earned: {earnedBalance?.toDecimalStandardUnit(2)}</span>
        <span>Staked: {stakedBalance?.toDecimalStandardUnit(2)}</span>
        <span>Locked: {lockedBalance?.toDecimalStandardUnit(2)}</span>
      </div>
    </div>
  );
};

export default Rewards;
