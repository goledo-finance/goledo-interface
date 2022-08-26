import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import styles from '../index.module.css';
import { useTokens, useCurUserBorrowPrice, useCurUserBorrowAPY, useUserData } from '@store/index';

const Zero = Unit.fromMinUnit(0);
const PointZeroOne = Unit.fromMinUnit(0.01);
const Hundred = Unit.fromMinUnit(100);

const YourBorrows: React.FC = () => {
  const tokens = useTokens();
  const curUserBorrowTokens = useMemo(() => tokens?.filter((token) => token.borrowBalance?.greaterThan(Zero)), [tokens]);
  const curUserBorrowPrice = useCurUserBorrowPrice();
  const curUserBorrowAPY = useCurUserBorrowAPY();
  const userData = useUserData();

  return (
    <div className={styles.table}>
      <div className={styles.title}>
        <span>Your Borrows</span>
        <div>Hide</div>
      </div>
      <div className={styles.subheader}>
        <div className={styles.gap}>
          <span className={styles.data}>{`balance $${curUserBorrowPrice?.toDecimalStandardUnit(2)}`}</span>
          <span className={styles.data}>{`APY ${curUserBorrowAPY?.mul(Hundred).toDecimalMinUnit(2)}%`}</span>
          <span className={styles.data}>{`Borrow power used ${userData?.borrowPowerUsed ? `${userData?.borrowPowerUsed}%` : '--'}`}</span>
        </div>
      </div>
      <div>
        {curUserBorrowTokens?.map((token) => (
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
