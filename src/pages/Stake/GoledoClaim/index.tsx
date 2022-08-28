import React from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useGoledoStakedBalance, useGoledoVestingBalance, useGoledoWithdrawableBalance, useGoledoUnlockedableBalance } from '@store/index';
import Card from '@components/Card';
import Button from '@components/Button';
import Goledo from '@assets/tokens/goledo.svg';

const Zero = Unit.fromMinUnit(0);

const GoledoClaim: React.FC = () => {
  const stakedBalance = useGoledoStakedBalance();
  const vestingBalance = useGoledoVestingBalance();
  const withdrawableBalance = useGoledoWithdrawableBalance();
  const unlockedableBalance = useGoledoUnlockedableBalance();

  return (
    <Card>
      <div className="relative flex justify-between items-center mb-10px lt-md:flex-col lt-md:items-start lt-md:text-left lt-md:gap-12px lt-md:mb-20px">
        <div className='max-w-42.5%'>
          <p className="text-18px text-#303549 font-semibold">Unlocked Goledo</p>
          <p>Staked Goledo and expried Goledo vests</p>
        </div>

        <p className="absolute right-162px flex items-center text-16px text-#303549 font-semibold lt-md:relative lt-md:right-none">
          <img className="w-20px h-20px mr-8px" src={Goledo} alt="Goledo" />
          {stakedBalance?.toDecimalStandardUnit(2)} Goledo
        </p>
        <Button size="large" className='lt-md:w-full'>Claim Goledo</Button>
      </div>

      <div className="relative flex justify-between items-center py-10px border-b-1px border-t-1px border-#EAEBEF lt-md:flex-col lt-md:items-start lt-md:text-left lt-md:gap-12px lt-md:py-20px">
        <div className='max-w-40%'>
          <p className="text-18px text-#303549 font-semibold">Vesting Goledo</p>
          <p>
            Goledo that can be claimed with a <span className="text-#FF0000">50% penalty</span>
          </p>
        </div>

        <p className="absolute right-162px flex items-center text-16px text-#303549 font-semibold lt-md:relative lt-md:right-none">
          <img className="w-20px h-20px mr-8px" src={Goledo} alt="Goledo" />
          {vestingBalance?.toDecimalStandardUnit(2)} Goledo
        </p>
      </div>

      <div className="relative flex justify-between items-center py-10px border-b-1px border-#EAEBEF lt-md:flex-col lt-md:items-start lt-md:text-left lt-md:gap-12px lt-md:py-20px">
        <div className='max-w-60%'>
          <p className="text-18px text-#303549 font-semibold">Claim all of the above</p>
          Early exit penalty <span className="text-#FF0000">{withdrawableBalance?.penaltyAmount?.toDecimalStandardUnit(2)}</span> Goledo
        </div>

        <Button size="large" className='lt-md:w-full'>Claim All</Button>
      </div>

      <div className="relative flex justify-between items-center pt-10px lt-md:flex-col lt-md:items-start lt-md:text-left lt-md:gap-12px lt-md:pt-20px">
        <div className='max-w-47.5%'>
          <p className="text-18px text-#303549 font-semibold">Expired locked Goledo</p>
          <p>Goledo locks that have exceeded the 3 month lock period and are now withdrawable</p>
        </div>

        <p className="absolute right-162px flex items-center text-16px text-#303549 font-semibold lt-md:relative lt-md:right-none">
          <img className="w-20px h-20px mr-8px" src={Goledo} alt="Goledo" />
          {unlockedableBalance?.toDecimalStandardUnit(2)} Goledo
        </p>
        <Button size="large" disabled={!unlockedableBalance?.greaterThan(Zero)} className='lt-md:w-full'>
          Withdraw
        </Button>
      </div>
    </Card>
  );
};

export default GoledoClaim;
