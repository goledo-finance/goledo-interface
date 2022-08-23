import React from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { type Token } from '../index';

const PointZeroOne = Unit.fromMinUnit(0.01);
const Hundred = Unit.fromMinUnit(100);

const ReserveOverview: React.FC<Token> = ({
    symbol,
    usdPrice,
    supplyAPY,
    borrowAPY,
    totalSupplyBalance,
    totalSupplyPrice,
    totalBorrowBalance,
    totalBorrowPrice,
    availableBalance,
    availablePrice,
    maxLTV,
    liquidationThreshold,
    liquidationPenalty,
    canBecollateral
}) => {
  return (
    <div className='mt-80px'>
      <h2>ReserveOverview</h2>

      <div className='flex gap-20px'>
        <span>Total Borrowed</span>
        <span>
          {totalBorrowBalance?.toDecimalStandardUnit(2) ?? '--'}
          (${totalBorrowPrice?.toDecimalStandardUnit(2) ?? '--'})
        </span>
      </div>

      <div className='flex gap-20px'>
        <span>Available Liquidity</span>
        <span>
          {availableBalance?.toDecimalStandardUnit(2) ?? '--'}
          (${availablePrice?.toDecimalStandardUnit(2) ?? '--'})
        </span>
      </div>

      <div className='flex gap-20px'>
        <span>Maximum LTV</span>
        <span>
          {maxLTV ? `${maxLTV}%` : '--'}
        </span>
      </div>

      <div className='flex gap-20px'>
        <span>Liquidation threshold</span>
        <span>
          {liquidationThreshold ? `${liquidationThreshold}%` : '--'}
        </span>
      </div>

      <div className='flex gap-20px'>
        <span>Liquidation penalty</span>
        <span>
          {liquidationPenalty ? `${liquidationPenalty}%` : '--'}
        </span>
      </div>

      <div className='flex gap-20px'>
        <span>Used Colloteral</span>
        <span>
          {canBecollateral ? '✅ Can be collateral' : canBecollateral === false ? `❎ Can't be collateral` : '--'}
        </span>
      </div>

      <div className='flex gap-20px'>
        <span>Deposit APY</span>
        <span>{supplyAPY?.greaterThan(PointZeroOne) ? `${supplyAPY.mul(Hundred).toDecimalMinUnit(2)}%` : '<0.01%'}</span>
      </div>

      <div className='flex gap-20px'>
        <span>Borrow APY</span>
        <span>{borrowAPY?.greaterThan(PointZeroOne) ? `${borrowAPY.mul(Hundred).toDecimalMinUnit(2)}%` : '<0.01%'}</span>
      </div>
    </div>
  );
};

export default ReserveOverview;
