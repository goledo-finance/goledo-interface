import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useGoledoStakeAPR } from '@store/index';
import Card from '@components/Card';
import Button from '@components/Button';

const Hundred = Unit.fromMinUnit(100);

const StakeGoledo: React.FC = () => {
  const stakeAPR = useGoledoStakeAPR();
  const APR = useMemo(() => <span className="text-20px text-#3AC170 font-bold">APR {stakeAPR?.mul(Hundred).toDecimalMinUnit(2)}%</span>, [stakeAPR]);

  return (
    <Card title="Stake Goledo" titleRight={APR} titleIcon="i-uil:shield-plus">
      <p className='my-16px'>Stake Goledo and earn platform fees with no lockup period.</p>
      <Button fullWidth size='large'>Stake</Button>
    </Card>
  );
};

export default StakeGoledo;
