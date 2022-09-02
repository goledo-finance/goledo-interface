import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useGoledoLockAPR, useGoledoBalance } from '@store/index';
import Card from '@components/Card';
import Button from '@components/Button';
import showLockGolModal from '@service/handleStakeAndLockGol';

const Zero = Unit.fromMinUnit(0);
const Hundred = Unit.fromMinUnit(100);

const LockGoledo: React.FC = () => {
  const lockAPR = useGoledoLockAPR();
  const balance= useGoledoBalance();
  const APR = useMemo(() => <span className="text-20px text-#3AC170 font-bold">APR {lockAPR?.mul(Hundred).toDecimalStandardUnit(4)}%</span>, [lockAPR]);

  return (
    <Card title="Lock Goledo" titleRight={APR} titleIcon="i-bytesize:lock">
      <p className='mt-16px'>Lock Goledo and earn platform fees and penalty fees in unlocked Goledo.</p>
      <p className='my-16px'>Locked Goledo is subjext to a three month lock and will continue to earn fees after the locks expire if you do not withdraw.</p>
      <Button fullWidth size='large' loading={!balance} disabled={balance?.equalsWith(Zero)} onClick={() => showLockGolModal({ type: 'Lock' })}>Lock</Button>
    </Card>
  );
};

export default LockGoledo;
