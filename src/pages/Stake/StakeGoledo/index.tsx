import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useGoledoStakeAPR, useGoledoBalance } from '@store/index';
import Card from '@components/Card';
import Button from '@components/Button';
import showStakeGolModal from '@service/handleStakeAndLockGol';

const Zero = Unit.fromMinUnit(0);
const Hundred = Unit.fromMinUnit(100);

const StakeGoledo: React.FC = () => {
  const stakeAPR = useGoledoStakeAPR();
  const balance = useGoledoBalance();
  const APR = useMemo(() => <span className="text-20px text-#3AC170 font-bold">APR {stakeAPR?.mul(Hundred).toDecimalMinUnit(2)}%</span>, [stakeAPR]);

  return (
    <Card title="Stake Goledo" titleRight={APR} titleIcon="i-uil:shield-plus">
      <p className="my-16px">Stake Goledo and earn platform fees with no lockup period.</p>
      <Button fullWidth size="large" loading={!balance} disabled={balance?.equalsWith(Zero)} onClick={() => showStakeGolModal({ type: 'Stake' })}>
        Stake
      </Button>
    </Card>
  );
};

export default StakeGoledo;
