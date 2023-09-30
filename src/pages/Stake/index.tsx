import React from 'react';
import PageHeader from '@modules/Layout/PageHeader';
import PageWrapper from '@modules/Layout/PageWrapper';
import AuthConnectPage from '@modules/AuthConnectPage';
import useIsAuthed from '@hooks/useIsAuthed';
import { useIsInVestingLockTime } from '@store/index';
import StakeGoledo from './StakeGoledo';
import LockGoledo from './LockGoledo';
import LP from './LP';
import GoledoClaim from './GoledoClaim';
import GoledoVest from './GoledoVest';
import GoledoLock from './GoledoLock';
import ClaimableFees from './ClaimableFees';

const Stake: React.FC = () => {
  const isAuthed = useIsAuthed();
  const isInVestingLockTime = useIsInVestingLockTime();

  return (
    <>
      <PageHeader className="pt-36px">
        <p className="text-68px text-#F1F1F3 font-bold lt-lg:text-center">Stake</p>
        <p className="mt-10px leading-24px text-16px text-#F1F1F3 lt-lg:text-center">
          Please Note: Goledo will soon be launching GOLv2. Users are advised not to lock or stake GOL at this time. Users do not need to unlock, unstake, or
          early claim vesting GOL for the GOL v2 airdrop. We will notify once the token transition is done
        </p>
      </PageHeader>
      <PageWrapper className="stake flex gap-24px lt-lg:flex-col lt-lg:gap-18px">
        {!isAuthed && <AuthConnectPage>{(action) => <p className="text-14px text-#62677B">{action} to stake.</p>}</AuthConnectPage>}
        {isAuthed && (
          <>
            <div className="w-470px flex flex-col flex-auto gap-10px lt-lg:w-full lt-lg:gap-18px">
              <StakeGoledo />
              <LockGoledo />
              {!isInVestingLockTime && <LP />}
            </div>

            <div className="w-750px flex flex-col flex-auto	gap-10px lt-lg:w-full lt-lg:gap-18px">
              <GoledoClaim />
              <GoledoVest />
              <GoledoLock />
              <ClaimableFees />
            </div>
          </>
        )}
      </PageWrapper>
    </>
  );
};

export default Stake;
