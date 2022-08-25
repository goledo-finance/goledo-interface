import React from 'react';
import { useGoledoEarnedBalance, useGoledoStakedBalance, useGoledoLockedBalance } from '@store/index';
import styles from '../index.module.css';
import cx from 'clsx';

const Rewards: React.FC = () => {
  const earnedBalance = useGoledoEarnedBalance();
  const stakedBalance = useGoledoStakedBalance();
  const lockedBalance = useGoledoLockedBalance();

  return (
    <div className={styles.table}>
      <div className={styles.title}>
        <span>Rewards</span>
        <div className="text-#62677B cursor-pointer">Hide</div>
      </div>
      <div className={styles.header}>
        <div className={cx(styles.item, '!justify-start')}>Assets</div>
        <div className={styles.item}>Earned</div>
        <div className={styles.item}>APY</div>
        <div className={styles.item}>You staked balance</div>
        <div className={styles.item}>You locked balance</div>
        <div className={cx(styles.item, 'min-w-170px max-w-170px')}></div>
      </div>
      <div className={styles.content}>
        <div className={cx(styles.item, '!justify-start')}>
          <img src="src/assets/icons/tokens/gol.svg" alt="goledo" className="w-8 h-8 mr-3" />GOL</div>
        <div className={styles.item}>{earnedBalance?.toDecimalStandardUnit(2)}</div>
        <div className={styles.item}>0%</div>
        <div className={styles.item}>{stakedBalance?.toDecimalStandardUnit(2)}</div>
        <div className={styles.item}>{lockedBalance?.toDecimalStandardUnit(2)}</div>
        <div className={cx(styles.item, 'min-w-170px max-w-170px')}></div>
      </div>
    </div>
  );
};

export default Rewards;
