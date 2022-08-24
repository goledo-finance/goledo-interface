import React from 'react';
import { useGoledoStakedBalance, useGoledoVestingBalance, useGoledoWithdrawableBalance, useGoledoUnlockedableBalance } from '@store/index';

const GoledoClaim: React.FC = () => {
  const stakedBalance = useGoledoStakedBalance();
  const vestingBalance = useGoledoVestingBalance();
  const withdrawableBalance = useGoledoWithdrawableBalance();
  const goledoUnlockedableBalance = useGoledoUnlockedableBalance();

  return (
    <div>
      <div className="border-b-1px border-#EAEBEF mb-32px">
        <div className="flex items-center">
          <div className="mr-auto">
            <p className="font-bold">Unlocked Goledo</p>
            <p>Staked Goledo and expried Goledo vests</p>
          </div>

          <span>{stakedBalance?.toDecimalStandardUnit(2)} Goledo</span>
          <button>Claim Goledo</button>
        </div>
      </div>

      <div className="border-b-1px border-#EAEBEF mb-32px">
        <div className="flex items-center">
          <div className="mr-auto">
            <p className="font-bold">Vesting Goledo</p>
            <p>
              Goledo that can be claimed with a <span className="text-red">50% penalty</span>
            </p>
          </div>

          <span>{vestingBalance?.toDecimalStandardUnit(2)} Goledo</span>
        </div>
      </div>

      <div className="border-b-1px border-#EAEBEF mb-32px">
        <div className="flex items-center">
          <div className="mr-auto">
            <p className="font-bold">Claim all of the above</p>
            <p>
              Early exit penalty <span className="text-red">{withdrawableBalance?.penaltyAmount?.toDecimalStandardUnit(2)}</span> Goledo
            </p>
          </div>

          <button>Claim All</button>
        </div>
      </div>

      <div className="border-b-1px border-#EAEBEF mb-32px">
        <div className="flex items-center">
          <div className="mr-auto">
            <p className="font-bold">Expired locked Goledo</p>
            <p>
              Goledo locks that have exceeded the 3 month lock
              <br />
              period and are now withdrawable
            </p>
          </div>

          <span>{goledoUnlockedableBalance?.toDecimalStandardUnit(2)} Goledo</span>
          <button>Withdraw</button>
        </div>
      </div>
    </div>
  );
};

export default GoledoClaim;
