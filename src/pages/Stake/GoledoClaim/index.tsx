import React, { useRef, useLayoutEffect } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import {
  useGoledoStakedBalance,
  useGoledoVestingBalance,
  useGoledoWithdrawableBalance,
  useGoledoUnlockedableBalance,
  useIsInVestingLockTime,
  useVestingLockTimestamp,
  checkVestingLockTime,
} from '@store/index';
import Card from '@components/Card';
import Button from '@components/Button';
import BalanceText from '@modules/BalanceText';
import timerNotifier from '@utils/timerNotifier';
import Goledo from '@assets/tokens/goledo.svg';
import handleClaimGoledo from '@service/handleClaimGoledo';
import handleClaimAllGoledo from '@service/handleClaimAllGoledo';
import handleWithdrawGoledo from '@service/handleWithdrawGoledo';

const Zero = Unit.fromMinUnit(0);

const GoledoClaim: React.FC = () => {
  const stakedBalance = useGoledoStakedBalance();
  const vestingBalance = useGoledoVestingBalance();
  const withdrawableBalance = useGoledoWithdrawableBalance();
  const unlockedableBalance = useGoledoUnlockedableBalance();
  const isInVestingLockTime = useIsInVestingLockTime();
  const vestingLockTimestamp = useVestingLockTimestamp();

  const openingDOM = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!isInVestingLockTime || !vestingLockTimestamp || !openingDOM.current) return;
    const timerUnit: Parameters<typeof timerNotifier.addUnit>[0] = {
      key: 'openning-timer',
      type: 'second',
      update: (remainTime) => {
        if (!openingDOM.current) return;
        openingDOM.current.innerText = `${+remainTime.days * 24 + +remainTime.hours}h:${remainTime.minutes}m:${remainTime.seconds}s`;
      },
      endDate: new Date(vestingLockTimestamp),
      onEnd: () => {
        checkVestingLockTime();
        setTimeout(checkVestingLockTime, 1000);
        setTimeout(checkVestingLockTime, 5000);
        setTimeout(checkVestingLockTime, 10000);
      },
    };
    timerNotifier.addUnit(timerUnit);

    return () => {
      timerNotifier.deleteUnit('openning-timer');
    };
  }, [isInVestingLockTime, vestingLockTimestamp]);

  return (
    <Card>
      <div className="relative flex justify-between items-center mb-10px lt-md:flex-col lt-md:items-start lt-md:text-left lt-md:gap-12px lt-md:mb-20px">
        <div className="md:max-w-42.5%">
          <p className="mb-2px text-18px text-#303549 font-semibold">Unlocked Goledo</p>
          <p>Staked Goledo and expired Goledo vests</p>
        </div>

        <p className="absolute right-162px flex items-center text-16px text-#303549 font-semibold lt-md:relative lt-md:right-none">
          <img className="w-20px h-20px mr-8px" src={Goledo} alt="Goledo" />
          <BalanceText balance={stakedBalance} symbol="Goledo" id="unlocked-goledo-balance" />
        </p>
        <Button
          id="stake-goledo-claim-claim-btn"
          size="large"
          className="lt-md:w-full"
          loading={!stakedBalance}
          disabled={stakedBalance?.equalsWith(Zero)}
          onClick={handleClaimGoledo}
        >
          Claim Goledo
        </Button>
      </div>

      <div className="relative flex justify-between items-center py-10px border-b-1px border-t-1px border-#EAEBEF lt-md:flex-col lt-md:items-start lt-md:text-left lt-md:gap-12px lt-md:py-20px">
        <div className="md:max-w-40%">
          <p className="mb-2px text-18px text-#303549 font-semibold">Vesting Goledo</p>
          <p>
            Goledo that can be claimed with a <span className="text-#FF0000">50% penalty</span>
          </p>
        </div>

        <p className="absolute right-162px flex items-center text-16px text-#303549 font-semibold lt-md:relative lt-md:right-none">
          <img className="w-20px h-20px mr-8px" src={Goledo} alt="Goledo" />
          <BalanceText balance={vestingBalance} symbol="Goledo" id="vesting-goledo-balance" />
        </p>
      </div>

      <div className="relative flex justify-between items-center py-10px border-b-1px border-#EAEBEF lt-md:flex-col lt-md:items-start lt-md:text-left lt-md:gap-12px lt-md:py-20px">
        <div className="md:max-w-60%">
          <p className="mb-2px text-18px text-#303549 font-semibold">Claim all of the above</p>
          Early exit penalty <BalanceText className="text-#FF0000" balance={withdrawableBalance?.penaltyAmount} id="expired--locked-goledo-balance" /> Goledo
        </div>

        {isInVestingLockTime && vestingLockTimestamp && (
          <div className="absolute right-162px md:text-right text-16px text-#303549 font-semibold lt-md:relative lt-md:right-none">
            <div className="mb-3px text-14px font-normal text-#62677B">Opening at:</div>
            <div ref={openingDOM}>:</div>
          </div>
        )}
        <Button
          id="stake-goledo-claim-claim-all-btn"
          size="large"
          className="lt-md:w-full"
          loading={!stakedBalance || !withdrawableBalance}
          disabled={isInVestingLockTime || !withdrawableBalance || withdrawableBalance.penaltyAmount.equalsWith(Zero)}
          onClick={handleClaimAllGoledo}
        >
          Claim All
        </Button>
      </div>

      <div className="relative flex justify-between items-center pt-10px lt-md:flex-col lt-md:items-start lt-md:text-left lt-md:gap-12px lt-md:pt-20px">
        <div className="md:max-w-47.5%">
          <p className="mb-2px text-18px text-#303549 font-semibold">Expired locked Goledo</p>
          <p>Goledo locks that have exceeded the 3 month lock period and are now withdrawable</p>
        </div>

        <p className="absolute right-162px flex items-center text-16px text-#303549 font-semibold lt-md:relative lt-md:right-none">
          <img className="w-20px h-20px mr-8px" src={Goledo} alt="Goledo" />
          <BalanceText balance={unlockedableBalance} symbol="Goledo" />
        </p>
        <Button
          id="stake-goledo-claim-withdraw-btn"
          size="large"
          className="lt-md:w-full"
          loading={!unlockedableBalance}
          disabled={!unlockedableBalance?.greaterThan(Zero)}
          onClick={handleWithdrawGoledo}
        >
          Withdraw
        </Button>
      </div>
    </Card>
  );
};

export default GoledoClaim;
