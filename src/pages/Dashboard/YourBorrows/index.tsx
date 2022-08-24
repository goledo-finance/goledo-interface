import React from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens, useCurUserBorrowPrice, useCurUserBorrowAPY, useBorrowPowerUsed } from '@store/index';
import { useCurUserBorrowTokens } from '@hooks/index';

const PointZeroOne = Unit.fromMinUnit(0.01);
const Hundred = Unit.fromMinUnit(100);

const YourBorrows: React.FC = () => {
  const tokens = useTokens();
  const borrowTokens = useCurUserBorrowTokens(tokens);
  const curUserBorrowPrice = useCurUserBorrowPrice();
  const curUserBorrowAPY = useCurUserBorrowAPY();
  const borrowPowerUsed = useBorrowPowerUsed();

  return (
    <div>
      <h3>YourBorrows</h3>
      <div className="mb-12px flex gap-12px">
        <span>totalPrice: {curUserBorrowPrice?.toDecimalStandardUnit(2)}$</span>
        <span>totalAPY: {curUserBorrowAPY?.mul(Hundred).toDecimalMinUnit(2)}%</span>
        <span>Borrow power used: {borrowPowerUsed ? `${borrowPowerUsed}%` : '--'}</span>
      </div>

      <div>
        {borrowTokens?.map((token) => (
          <div className="flex gap-12px" key={token.address}>
            <span>{token.symbol}</span>
            <span>DEBT: {token.borrowBalance?.toDecimalStandardUnit(2, token.decimals)}</span>
            <span>Price: {token.borrowPrice?.toDecimalStandardUnit(2)}$</span>
            <span>APY: {token.borrowAPY?.greaterThan(PointZeroOne) ? `${token.borrowAPY.mul(Hundred).toDecimalMinUnit(2)}%` : '<0.01%'}</span>
            <button>Repay</button>
            <button>Borrow</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YourBorrows;
