import React from 'react';
import PageHeader from '@modules/Layout/PageHeader';
import PageWrapper from '@modules/Layout/PageWrapper';
import StakeGoledo from './StakeGoledo';
import LockGoledo from './LockGoledo';
import LP from './LP';
import GoledoClaim from './GoledoClaim';
import GoledoVest from './GoledoVest';
import GoledoLock from './GoledoLock';
import Tmp from './Tmp';

const Stake: React.FC = () => {
  return (
    <>
      <PageHeader className='pt-36px'>
        <p className='text-68px text-#F1F1F3 font-bold lt-lg:text-center'>Stake</p>
      </PageHeader>
      <PageWrapper className='stake flex gap-24px lt-lg:flex-col lt-lg:gap-18px'>
        <div className='w-470px flex flex-col flex-auto gap-10px lt-lg:w-full lt-lg:gap-18px'>
          <StakeGoledo />
          <LockGoledo />
          <LP />
        </div>

        <div className='w-750px flex flex-col flex-auto	gap-10px lt-lg:w-full lt-lg:gap-18px'>
          <GoledoClaim />
          <GoledoVest />
          <GoledoLock />
          <Tmp />
        </div>
      </PageWrapper>
    </>
  )
};

export default Stake;
