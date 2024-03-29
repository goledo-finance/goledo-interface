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
import Card from '@components/Card';

const Stake: React.FC = () => {
  const isAuthed = useIsAuthed();
  const isInVestingLockTime = useIsInVestingLockTime();

  return (
    <>
      <PageHeader className="pt-36px">
        <p className="text-68px text-#F1F1F3 font-bold lt-lg:text-center">Stake</p>
        <a
          className="block mt-4px leading-24px text-16px text-#F1F1F3 lt-lg:text-center"
          href="https://v1.goledo.cash"
          target="_blank"
          rel="noopener noreferrer"
        >
          Claim fee reward & LP in v1
        </a>
      </PageHeader>
      <PageWrapper className="stake flex gap-24px lt-lg:flex-col lt-lg:gap-18px">
        {!isAuthed && <AuthConnectPage>{(action) => <p className="text-14px text-#62677B">{action} to stake.</p>}</AuthConnectPage>}
        {isAuthed && (
          <>
            <div className="w-470px flex flex-col flex-auto gap-10px lt-lg:w-full lt-lg:gap-18px">
              <StakeGoledo />
              <LockGoledo />
              {!isInVestingLockTime && <LP />}
              <Card>
                <a
                  className="block mt-4px leading-24px text-16px text-#303549 lt-lg:text-center"
                  href="https://v1.goledo.cash"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Claim fee reward & LP in v1
                </a>
              </Card>
            </div>

            <div className="w-750px flex flex-col flex-auto	gap-10px lt-lg:w-full lt-lg:gap-18px">
              <GoledoClaim />
              <GoledoVest />
              <GoledoLock />
              <ClaimableFees version="V2" />
            </div>
          </>
        )}
      </PageWrapper>
    </>
  );
};

export default Stake;
