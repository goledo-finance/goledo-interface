import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens } from '@store/index';
import { useUserBorrowTokens, useUserTotalBorrowPrice, useUserTotalBorrowAPY } from '@hooks/index';

const PointZeroOne = Unit.fromMinUnit(0.01);
const Hundred = Unit.fromMinUnit(100);

const YourBorrows: React.FC = () => {
  const tokens = useTokens();
  const borrowTokens = useUserBorrowTokens(tokens);
  const totalBorrowPrice = useUserTotalBorrowPrice(borrowTokens);
  const totalBorrowAPY = useUserTotalBorrowAPY(borrowTokens, totalBorrowPrice);

  return (
    <div>
      <h3>YourBorrows</h3>
      <div className="mb-12px flex gap-12px">
        <span>totalPrice: {totalBorrowPrice?.toDecimalStandardUnit(2)}$</span>
        <span>totalAPY: {totalBorrowAPY?.mul(Hundred).toDecimalMinUnit(2)}%</span>
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
