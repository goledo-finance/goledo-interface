import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import styles from '../index.module.css';
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
    () =>
      !curUserSupplyTokens?.length
        ? undefined
        : curUserSupplyTokens.filter((token) => token.collateral).reduce((pre, cur) => pre.add(cur.supplyPrice ?? Zero), Zero),
    [curUserSupplyTokens]
  );
  
  return (
    <div className={styles.table}>
      <div className={styles.title}>
        <span>Your Supplies</span>
        <div className={styles.hider}>Hide</div>
      </div>
      <div className={styles.subheader}>
        <div className={styles.gap}>
          <span className={styles.data}>{`balance $${curUserSupplyPrice?.toDecimalStandardUnit(2)}`}</span>
          <span className={styles.data}>{`totalAPY ${curUserSupplyAPY?.mul(Hundred).toDecimalMinUnit(2)}%`}</span>
          <span className={styles.data}>{`totalCollateralPrice $${totalCollateralPrice?.toDecimalStandardUnit(2)}`}</span>
        </div>
      </div>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.item}>Assets</div>
          <div className={styles.item}>Balance</div>
          <div className={styles.item}>APY</div>
          <div className={styles.item}>Collateral</div>
          <div className={styles.item}></div>
        </div>
        {curUserSupplyTokens?.map((token) => (
          <div className={styles.content} key={token.address}>
            <div className={styles.item}>
              <div className={styles.icon}>
                <img src={`src/assets/icons/tokens/${token.symbol.toLowerCase()}.svg`} alt="goledo" className="w-8 h-8 mr-3" />
                {token.symbol}
              </div>
            </div>
            <div className={styles.item}>
              <span>{token.supplyBalance?.toDecimalStandardUnit(2, token.decimals)}</span>
              <span>${token.supplyPrice?.toDecimalStandardUnit(2)}</span>
            </div>
            <div className={styles.item}>{token.supplyAPY?.greaterThan(PointZeroOne) ? `${token.supplyAPY.mul(Hundred).toDecimalMinUnit(2)}%` : '<0.01%'}</div>
            <div className={styles.item}>{String(token.collateral)}</div>
            <div className={styles.item}>
              <div className={styles.button}>
                <button>Withdraw</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YourSupplies;
