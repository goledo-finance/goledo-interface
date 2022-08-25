import React from 'react';
import { useGoledoStakeAPR } from '@store/index';

const StakeGoledo: React.FC = () => {
  const goledoStakeAPR = useGoledoStakeAPR();

  return (
    <div>
      <p className='flex'>
        <span className='mr-auto'>Stake Goledo</span>
        <span>APR {goledoStakeAPR?.toDecimalMinUnit(2)}%</span>
      </p>

      <p>Stake Goledo and earn platform fees with no lockup period.</p>
      <button>Stake</button>
    </div>
  );
};

export default StakeGoledo;
