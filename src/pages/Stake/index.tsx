import React from 'react';
import cx from 'clsx';
import StakeGoledo from './StakeGoledo';
import LockGoledo from './LockGoledo';
import LP from './LP';
import GoledoClaim from './GoledoClaim';
import GoledoVest from './GoledoVest';
import GoledoLock from './GoledoLock';
import Tmp from './Tmp';
import styles from './index.module.css';

const Stake: React.FC = () => {
  return (
    <div className={cx('mx-auto max-w-1180px flex gap-20px', styles.stake)}>
      <div className='w-470px flex flex-col gap-10px'>
        <StakeGoledo />
        <LockGoledo />
        <LP />
      </div>

      <div className='w-750px flex flex-col gap-10px'>
        <GoledoClaim />
        <GoledoVest />
        <GoledoLock />
        <Tmp />
      </div>
    </div>
  )
};

export default Stake;
