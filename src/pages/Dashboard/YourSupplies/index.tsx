import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens } from '@store/index';
import { useUserSupplyTokens, useUserTotalSupplyPrice, useUserTotalSupplyAPY } from '@hooks/index';

const Zero = Unit.fromMinUnit(0);
const PointZeroOne = Unit.fromMinUnit(0.01);
const Hundred = Unit.fromMinUnit(100);

const YourSupplies: React.FC = () => {
  const tokens = useTokens();
  const supplyTokens = useUserSupplyTokens(tokens);
  const totalSupplyPrice = useUserTotalSupplyPrice(supplyTokens);
  const totalSupplyAPY = useUserTotalSupplyAPY(supplyTokens, totalSupplyPrice);
  const totalCollateralPrice = useMemo(
    () => (!supplyTokens?.length ? undefined : supplyTokens.filter((token) => token.collateral).reduce((pre, cur) => pre.add(cur.supplyPrice ?? Zero), Zero)),
    [supplyTokens]
  );

  return (
    <div>
      <h3>Your Supplies</h3>
      <div className="mb-12px flex gap-12px">
        <span>totalPrice: {totalSupplyPrice?.toDecimalStandardUnit(2)}$</span>
        <span>totalAPY: {totalSupplyAPY?.mul(Hundred).toDecimalMinUnit(2)}%</span>
        <span>totalCollateralPrice: {totalCollateralPrice?.toDecimalStandardUnit(2)}$</span>
      </div>

      <div>
        {supplyTokens?.map((token) => (
          <div className="flex gap-12px" key={token.address}>
            <span>{token.symbol}</span>
            <span>Balance: {token.supplyBalance?.toDecimalStandardUnit(2, token.decimals)}</span>
            <span>Price: {token.supplyPrice?.toDecimalStandardUnit(2)}$</span>
            <span>APY: {token.supplyAPY?.greaterThan(PointZeroOne) ? `${token.supplyAPY.mul(Hundred).toDecimalMinUnit(2)}%` : '<0.01%'}</span>
            <span>Collateral: {String(token.collateral)}</span>
            <button>Withdraw</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YourSupplies;
