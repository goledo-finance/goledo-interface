import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useGoledoLockAPR, useGoledoBalance, useIsInVestingLockTime } from '@store/index';
import Card from '@components/Card';
import Button from '@components/Button';
import PercentageText from '@modules/PercentageText';
import showLockGolModal from '@service/handleStakeAndLockGol';

const Zero = Unit.fromMinUnit(0);

const LockGoledo: React.FC = () => {
  const isInVestingLockTime = useIsInVestingLockTime();
  const lockAPR = useGoledoLockAPR();
  const balance = useGoledoBalance();
  const APR = useMemo(
    () => <span className="text-20px text-#3AC170 font-bold" id="stake-goledo-APR">APR {isInVestingLockTime ? 'Infinity%' : <PercentageText value={lockAPR} />}</span>,
    [isInVestingLockTime, lockAPR]
  );
  return (
    <Card title="Lock Goledo" titleRight={APR} titleIcon="i-bytesize:lock">
      <p className="mt-16px">Lock Goledo and earn platform fees and penalty fees in unlocked Goledo.</p>
      <p className="my-16px">Locked Goledo is subject to a three-month lock period and will continue to earn fees after the locks expire if you do not withdraw.</p>
      <Button id='stake-lock-goledo-lock-btn' fullWidth size="large" loading={!balance} disabled={balance?.equalsWith(Zero)} onClick={() => showLockGolModal({ type: 'Lock' })}>
        Lock
      </Button>
    </Card>
  );
};

export default LockGoledo;
