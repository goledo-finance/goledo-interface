import React from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useLp } from '@store/index';
import Card from '@components/Card';
import Button from '@components/Button';
import BalanceText from '@modules/BalanceText';
import PercentageText from '@modules/PercentageText';
import showStakeAndUnstakeLPModal from '@service/handleStakeAndUnStakeLP';
import handleVestingGoledo from '@service/handleVestingGoledo';

const Zero = Unit.fromMinUnit(0);

const LP: React.FC = () => {
  const {
    stakeAPR,
    usdPrice,
    balance,
    totalMarketStakedBalance,
    totalMarketStakedPrice,
    stakedBalance,
    stakedPrice,
    earnedGoledoBalance,
    earnedGoledoPrice,
    totalRewardsPerDayBalance,
    totalRewardsPerDayPrice,
    totalRewardsPerWeekBalance,
    totalRewardsPerWeekPrice,
  } = useLp();

  return (
    <Card title="GOL/CFX LP" titleIcon="i-ri:copper-coin-line" className="flex flex-col gap-0px">
      <div className="flex justify-between items-center h-56px border-b-1px border-#eaebef">
        <span>Staking APR</span>
        <PercentageText className="text-#303549" value={stakeAPR} />
      </div>

      <div className="flex justify-between items-center h-56px border-b-1px border-#eaebef">
        <span>LP Token Price</span>
        <span className="text-#303549"><BalanceText balance={usdPrice?.mul(Unit.fromMinUnit(10e17))} abbrDecimals={2} symbolPrefix="$" /></span>
      </div>

      <div className="flex justify-between items-center h-56px border-b-1px border-#eaebef">
        <span>Total LP Tokens Staked</span>
        <div className="text-right">
          <p className="text-#303549"><BalanceText balance={totalMarketStakedBalance} symbol="GOLCFX" /></p>
          <p><BalanceText balance={totalMarketStakedPrice} abbrDecimals={2} symbolPrefix="$" /></p>
        </div>
      </div>

      <div className="flex justify-between items-center h-56px border-b-1px border-#eaebef">
        <span>Your Staked</span>
        <div className="text-right">
          <p className="text-#303549"><BalanceText balance={stakedBalance} symbol="GOLCFX" /></p>
          <p><BalanceText balance={stakedPrice} abbrDecimals={2} symbolPrefix="$" /></p>
        </div>
      </div>

      <div className="flex justify-between items-center h-56px border-b-1px border-#eaebef">
        <span>Pending Rewards</span>
        <div className="text-right">
          <p className="text-#303549"><BalanceText balance={earnedGoledoBalance} symbol="Goledo" /></p>
          <p><BalanceText balance={earnedGoledoPrice} abbrDecimals={2} symbolPrefix="$" /></p>
        </div>
      </div>

      <div className="flex justify-between items-center h-56px border-b-1px border-#eaebef">
        <span>Total Rewards per day</span>
        <div className="text-right">
          <p className="text-#303549"><BalanceText balance={totalRewardsPerDayBalance} symbol="Goledo" /></p>
          <p><BalanceText balance={totalRewardsPerDayPrice} abbrDecimals={2} symbolPrefix="$" /></p>
        </div>
      </div>

      <div className="flex justify-between items-center h-56px">
        <span>Total Rewards per week</span>
        <div className="text-right">
          <p className="text-#303549"><BalanceText balance={totalRewardsPerWeekBalance} symbol="Goledo" /></p>
          <p><BalanceText balance={totalRewardsPerWeekPrice} abbrDecimals={2} symbolPrefix="$" /></p>
        </div>
      </div>

      <div className="mt-12px flex gap-12px">
        <Button
          id='stake-lp-stake-btn'
          size="large"
          className="w-33% !flex-auto"
          loading={!balance}
          disabled={balance?.equalsWith(Zero)}
          onClick={() => showStakeAndUnstakeLPModal({ type: 'Stake' })}
        >
          Stake
        </Button>
        <Button
          id='stake-lp-unstake-btn'
          size="large"
          className="w-33% !flex-auto"
          loading={!balance}
          disabled={stakedBalance?.equalsWith(Zero)}
          onClick={() => showStakeAndUnstakeLPModal({ type: 'Unstake' })}
        >
          Unstake
        </Button>
        <Button
          id='stake-lp-vest-btn'
          size="large"
          className="w-33% !flex-auto"
          loading={!earnedGoledoBalance}
          disabled={earnedGoledoBalance?.equalsWith(Zero)}
          onClick={() => handleVestingGoledo({ tokenAddress: 'lp' })}
        >
          Vest
        </Button>
      </div>
    </Card>
  );
};

export default LP;
