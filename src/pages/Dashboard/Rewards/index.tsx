import React from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import {
  useGoledoEarnedBalance,
  useGoledoStakedBalance,
  useGoledoLockedBalance,
  useGoledoStakedPrice,
  useGoledoLockedPrice,
  useGoledoEarnedPrice,
  useGoledoStakeAPR,
  useGoledoLockAPR,
} from '@store/index';

const Hundred = Unit.fromMinUnit(100);

const Rewards: React.FC = () => {
  const earnedBalance = useGoledoEarnedBalance();
  const stakedBalance = useGoledoStakedBalance();
  const lockedBalance = useGoledoLockedBalance();
  const earnedPrice = useGoledoEarnedPrice();
  const stakedPrice = useGoledoStakedPrice();
  const lockedPrice = useGoledoLockedPrice();
  const stakeAPR = useGoledoStakeAPR();
  const lockAPR = useGoledoLockAPR();

  return (
    <div>
      <h3>Rewards</h3>

      <div className="flex gap-24px">
        <span>GOL</span>
        <span>
          Earned Balance: {earnedBalance?.toDecimalStandardUnit(2)}
          earned Price: {earnedPrice?.toDecimalStandardUnit(2)}$
        </span>
        <span>
          Staked Balance: {stakedBalance?.toDecimalStandardUnit(2)}
          Staked Price: {stakedPrice?.toDecimalStandardUnit(2)}$
          (APR: {stakeAPR?.mul(Hundred).toDecimalStandardUnit(2)}%)
        </span>
        <span>
          Locked Balance: {lockedBalance?.toDecimalStandardUnit(2)}
          Locked Price: {lockedPrice?.toDecimalStandardUnit(2)}$
          (APR: {lockAPR?.mul(Hundred).toDecimalStandardUnit(4)}%)
        </span>
      </div>
    </div>
  );
};

export default Rewards;
