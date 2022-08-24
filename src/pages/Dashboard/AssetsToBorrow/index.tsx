import React from 'react';
import { Link } from 'react-router-dom';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens } from '@store/index';

const PointZeroOne = Unit.fromMinUnit(0.01);
const Hundred = Unit.fromMinUnit(100);

const AssetsToBorrow: React.FC = () => {
  const tokens = useTokens();

  return (
    <div>
      <h3>AssetsToBorrow</h3>

      <div>
        {tokens?.map((token) => (
          <div className="flex gap-12px" key={token.address}>
            <span>{token.symbol}</span>
            <span>Available: {token.availableBorrowBalance?.toDecimalStandardUnit(2, token.decimals)}</span>
            <span>APY: {token.borrowAPY?.greaterThan(PointZeroOne) ? `${token.borrowAPY.mul(Hundred).toDecimalMinUnit(2)}%` : '<0.01%'}</span>
            <button>Borrow</button>
            <Link to={`/detail/${token.address}`}>
              <button>Detail</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetsToBorrow;
