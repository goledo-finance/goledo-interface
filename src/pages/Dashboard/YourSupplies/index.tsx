import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import styles from '../index.module.css';
import cx from 'clsx';
import { useTokens, useCurUserBorrowPrice, useCurUserSupplyAPY } from '@store/index';

const Zero = Unit.fromMinUnit(0);
const PointZeroOne = Unit.fromMinUnit(0.01);
const Hundred = Unit.fromMinUnit(100);

const YourSupplies: React.FC = () => {
  const tokens = useTokens();
  const curUserSupplyTokens = useMemo(() => tokens?.filter((token) => token.supplyBalance?.greaterThan(Zero)), [tokens]);
  const curUserSupplyPrice = useCurUserBorrowPrice();
  const curUserSupplyAPY = useCurUserSupplyAPY();
  const totalCollateralPrice = useMemo(
    () => (!curUserSupplyTokens?.length ? undefined : curUserSupplyTokens.filter((token) => token.collateral).reduce((pre, cur) => pre.add(cur.supplyPrice ?? Zero), Zero)),
    [curUserSupplyTokens]
  );

  return (
    <div className={styles.table}>
      <div className={styles.title}>
        <span>Rewards</span>
        <div className={styles.hider}>Hide</div>
      </div>
      <div className="mb-12px flex gap-12px">
        <span>totalPrice: {curUserSupplyPrice?.toDecimalStandardUnit(2)}$</span>
        <span>totalAPY: {curUserSupplyAPY?.mul(Hundred).toDecimalMinUnit(2)}%</span>
        <span>totalCollateralPrice: {totalCollateralPrice?.toDecimalStandardUnit(2)}$</span>
      </div>

      <div>
        {curUserSupplyTokens?.map((token) => (
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
