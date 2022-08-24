import React from 'react';

const StakeGoledo: React.FC = () => {
  return (
    <div>
      <p className='flex'>
        <span className='mr-auto'>Stake Goledo</span>
        <span>APR %</span>
      </p>

      <p>Stake Goledo and earn platform fees with no lockup period.</p>
      <button>Stake</button>
    </div>
  );
};

export default StakeGoledo;
