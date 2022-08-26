import React from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useGoledoStakeAPR } from '@store/index';

const Hundred = Unit.fromMinUnit(100);

const StakeGoledo: React.FC = () => {
  const stakeAPR = useGoledoStakeAPR();

  return (
    <div>
      <p className='flex'>
        <span className='mr-auto'>Stake Goledo</span>
        <span>APR {stakeAPR?.mul(Hundred).toDecimalMinUnit(2)}%</span>
      </p>

      <p>Stake Goledo and earn platform fees with no lockup period.</p>
      <button>Stake</button>
    </div>
  );
};

export default StakeGoledo;
