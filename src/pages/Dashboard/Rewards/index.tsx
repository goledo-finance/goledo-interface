import React from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import styles from '../../index.module.css';
import {
  useGoledoEarnedBalance,
  useGoledoStakedBalance,
  useGoledoLockedBalance,
  useGoledoStakedPrice,
  useGoledoLockedPrice,
  useGoledoEarnedPrice,
  useGoledoStakeAPR,
  useGoledoLockAPR,
} from '@store/index';

const Hundred = Unit.fromMinUnit(100);

const Rewards: React.FC = () => {
  const earnedBalance = useGoledoEarnedBalance();
  const stakedBalance = useGoledoStakedBalance();
  const lockedBalance = useGoledoLockedBalance();
  const earnedPrice = useGoledoEarnedPrice();
  const stakedPrice = useGoledoStakedPrice();
  const lockedPrice = useGoledoLockedPrice();
  const stakeAPR = useGoledoStakeAPR();
  const lockAPR = useGoledoLockAPR();

  return (
    <div className={styles.table}>
      <div className={styles.title}>
        <span>Rewards</span>
        <div className={styles.hide}>Hide</div>
      </div>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.item}>Assets</div>
          <div className={styles.item}>Earned</div>
          <div className={styles.item}>APY</div>
          <div className={styles.item}>You staked balance</div>
          <div className={styles.item}>You locked balance</div>
          <div className={styles.item}></div>
        </div>
        <div className={styles.content}>
          <div className={styles.item}>
            <div className={styles.icon}>
              <img src="src/assets/icons/tokens/gol.svg" alt="goledo" className="w-8 h-8 mr-3" />
              GOL
            </div>
          </div>
          <div className={styles.item}>
            {earnedBalance?.toDecimalStandardUnit(2)}
            <span>${earnedPrice?.toDecimalStandardUnit(2)}</span>
          </div>
          <div className={styles.item}>0%</div>
          <div className={styles.item}>
            <div className={styles.gap}>
              {stakedBalance?.toDecimalStandardUnit(2)}
              <div className={styles.data}>{`APR ${stakeAPR?.mul(Hundred).toDecimalStandardUnit(4)}%`}</div>
            </div>
            <span>${stakedPrice?.toDecimalStandardUnit(2)}</span>
          </div>
          <div className={styles.item}>
            <div className={styles.gap}>
              {lockedBalance?.toDecimalStandardUnit(2)}
              <div className={styles.data}>{`APR ${lockAPR?.mul(Hundred).toDecimalStandardUnit(4)}%`}</div>
            </div>
            <span>${lockedPrice?.toDecimalStandardUnit(2)}</span>
          </div>
          <div className={styles.item}>
            <div className={styles.button}>
              <button>Vest</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
