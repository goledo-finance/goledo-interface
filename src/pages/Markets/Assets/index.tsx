import React from 'react';
import { Link } from 'react-router-dom';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens } from '@store/index';

const PointZeroOne = Unit.fromMinUnit(0.01);
const Hundred = Unit.fromMinUnit(100);

const Assets: React.FC = () => {
  const tokens = useTokens();

  return (
    <div>
      <h3>AssetsToSupply</h3>

      <div>
        {tokens?.map((token) => (
          <div className="flex gap-20px" key={token.address}>
            <span>{token.symbol}</span>
            <span>Total Supply Balance: {token.totalSupplyBalance?.toDecimalStandardUnit(2, token.decimals)}</span>
            <span>Total Supply Price: {token.totalSupplyPrice?.toDecimalStandardUnit(2)}$</span>
            <span>Total Supply APY: {token.supplyAPY?.greaterThan(PointZeroOne) ? `${token.supplyAPY.mul(Hundred).toDecimalMinUnit(2)}%` : '<0.01%'}</span>
            <span>Total Borrow Balance: {token.totalBorrowBalance?.toDecimalStandardUnit(2, token.decimals)}</span>
            <span>Total Borrow Price: {token.totalBorrowPrice?.toDecimalStandardUnit(2)}$</span>
            <span>Total Borrow APY: {token.borrowAPY?.greaterThan(PointZeroOne) ? `${token.borrowAPY.mul(Hundred).toDecimalMinUnit(2)}%` : '<0.01%'}</span>
            <Link to={`/detail/${token.address}`}>
              <button>Detail</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assets;
